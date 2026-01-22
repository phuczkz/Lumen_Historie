const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mental_health_center'
});

async function migrateDatabase() {
  try {
    console.log('Starting database migration...');

    // 1. Drop duration_minutes if exists
    const [columns] = await connection.promise().query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = 'mental_health_center' 
       AND TABLE_NAME = 'services'`
    );
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    
    if (columnNames.includes('duration_minutes')) {
      console.log('Dropping duration_minutes column...');
      await connection.execute('ALTER TABLE services DROP COLUMN duration_minutes');
      console.log('✅ Dropped duration_minutes column');
    }

    // 2. Add number_of_sessions if not exists
    if (!columnNames.includes('number_of_sessions')) {
      console.log('Adding number_of_sessions column...');
      await connection.execute(
        'ALTER TABLE services ADD COLUMN number_of_sessions INT UNSIGNED NOT NULL DEFAULT 1 COMMENT "Số buổi"'
      );
      console.log('✅ Added number_of_sessions column');
    }

    // 3. Add article_content if not exists
    if (!columnNames.includes('article_content')) {
      console.log('Adding article_content column...');
      await connection.execute(
        'ALTER TABLE services ADD COLUMN article_content LONGTEXT COMMENT "Nội dung bài viết (HTML)"'
      );
      console.log('✅ Added article_content column');
    }

    // 4. Add image column if not exists
    if (!columnNames.includes('image')) {
      console.log('Adding image column...');
      await connection.execute(
        'ALTER TABLE services ADD COLUMN image VARCHAR(255) COMMENT "Ảnh dịch vụ"'
      );
      console.log('✅ Added image column');
    }

    // 5. Check if appointments table exists, if not create it
    const [tables] = await connection.promise().query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = 'mental_health_center' 
       AND TABLE_NAME = 'appointments'`
    );

    if (tables.length === 0) {
      console.log('Creating appointments table...');
      await connection.execute(`
        CREATE TABLE appointments (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          order_id INT UNSIGNED NOT NULL,
          session_number INT UNSIGNED NOT NULL COMMENT 'Buổi thứ mấy (1, 2, 3...)',
          scheduled_at DATETIME NOT NULL,
          status ENUM('pending','confirmed','completed','cancelled','rescheduled') NOT NULL DEFAULT 'pending',
          notes TEXT,
          completion_notes TEXT COMMENT 'Ghi chú sau khi hoàn thành',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          UNIQUE KEY uniq_order_session (order_id, session_number),
          INDEX idx_order_schedule (order_id, scheduled_at),
          INDEX idx_appointment_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('✅ Created appointments table');
    }

    // 6. Migrate data from sessions to appointments if sessions table exists
    const [sessionTables] = await connection.promise().query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = 'mental_health_center' 
       AND TABLE_NAME = 'sessions'`
    );

    if (sessionTables.length > 0) {
      console.log('Migrating data from sessions to appointments...');
      
      // Get all sessions data
      const [sessions] = await connection.promise().query('SELECT * FROM sessions ORDER BY order_id, scheduled_at');
      
      // Group by order_id and assign session numbers
      const orderSessions = {};
      sessions.forEach(session => {
        if (!orderSessions[session.order_id]) {
          orderSessions[session.order_id] = [];
        }
        orderSessions[session.order_id].push(session);
      });

      // Insert into appointments with session numbers
      for (const [orderId, orderSessionList] of Object.entries(orderSessions)) {
        for (let i = 0; i < orderSessionList.length; i++) {
          const session = orderSessionList[i];
          await connection.execute(`
            INSERT INTO appointments (order_id, session_number, scheduled_at, status, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            session.order_id,
            i + 1, // session_number starts from 1
            session.scheduled_at,
            session.status,
            session.notes,
            session.created_at,
            session.updated_at
          ]);
        }
      }
      
      console.log(`✅ Migrated ${sessions.length} sessions to appointments`);
    }

    // 7. Add new columns to orders table if not exists
    const [orderColumns] = await connection.promise().query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = 'mental_health_center' 
       AND TABLE_NAME = 'orders'`
    );
    
    const orderColumnNames = orderColumns.map(col => col.COLUMN_NAME);
    
    if (!orderColumnNames.includes('completed_sessions')) {
      console.log('Adding completed_sessions column to orders...');
      await connection.execute(
        'ALTER TABLE orders ADD COLUMN completed_sessions INT UNSIGNED NOT NULL DEFAULT 0 COMMENT "Số buổi đã hoàn thành"'
      );
      console.log('✅ Added completed_sessions column');
    }

    if (!orderColumnNames.includes('started_at')) {
      console.log('Adding started_at column to orders...');
      await connection.execute(
        'ALTER TABLE orders ADD COLUMN started_at DATETIME COMMENT "Ngày bắt đầu điều trị"'
      );
      console.log('✅ Added started_at column');
    }

    if (!orderColumnNames.includes('completed_at')) {
      console.log('Adding completed_at column to orders...');
      await connection.execute(
        'ALTER TABLE orders ADD COLUMN completed_at DATETIME COMMENT "Ngày hoàn thành điều trị"'
      );
      console.log('✅ Added completed_at column');
    }

    // 8. Update orders status enum if needed
    console.log('Updating orders status enum...');
    await connection.execute(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM('pending','confirmed','in_progress','completed','cancelled') 
      NOT NULL DEFAULT 'pending'
    `);
    console.log('✅ Updated orders status enum');

    // 9. Create stored procedures and triggers
    console.log('Creating stored procedures and triggers...');
    
    // Drop existing procedures/triggers if they exist
    await connection.execute('DROP PROCEDURE IF EXISTS CreateAppointmentsForOrder');
    await connection.execute('DROP TRIGGER IF EXISTS auto_create_appointments');
    await connection.execute('DROP TRIGGER IF EXISTS update_order_progress');

    // Create stored procedure
    await connection.execute(`
      CREATE PROCEDURE CreateAppointmentsForOrder(
        IN p_order_id INT UNSIGNED,
        IN p_service_sessions INT UNSIGNED,
        IN p_doctor_id INT UNSIGNED
      )
      BEGIN
        DECLARE i INT DEFAULT 1;
        DECLARE base_datetime DATETIME DEFAULT DATE_ADD(NOW(), INTERVAL 1 DAY);
        
        WHILE i <= p_service_sessions DO
          INSERT INTO appointments (order_id, session_number, scheduled_at, status)
          VALUES (
            p_order_id, 
            i, 
            DATE_ADD(base_datetime, INTERVAL (i-1) WEEK),
            'pending'
          );
          SET i = i + 1;
        END WHILE;
      END
    `);

    // Create triggers
    await connection.execute(`
      CREATE TRIGGER auto_create_appointments
      AFTER UPDATE ON orders
      FOR EACH ROW
      BEGIN
        IF OLD.status = 'pending' AND NEW.status = 'confirmed' THEN
          CALL CreateAppointmentsForOrder(NEW.id, NEW.number_of_sessions, NEW.doctor_id);
        END IF;
      END
    `);

    await connection.execute(`
      CREATE TRIGGER update_order_progress
      AFTER UPDATE ON appointments
      FOR EACH ROW
      BEGIN
        DECLARE completed_count INT DEFAULT 0;
        DECLARE total_sessions INT DEFAULT 0;
        
        IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
          SELECT COUNT(*) INTO completed_count
          FROM appointments 
          WHERE order_id = NEW.order_id AND status = 'completed';
          
          SELECT number_of_sessions INTO total_sessions
          FROM orders 
          WHERE id = NEW.order_id;
          
          UPDATE orders 
          SET 
            completed_sessions = completed_count,
            status = CASE 
              WHEN completed_count >= total_sessions THEN 'completed'
              WHEN completed_count > 0 THEN 'in_progress'
              ELSE status
            END,
            completed_at = CASE 
              WHEN completed_count >= total_sessions THEN NOW()
              ELSE completed_at
            END
          WHERE id = NEW.order_id;
        END IF;
      END
    `);

    console.log('✅ Created stored procedures and triggers');

    console.log('🎉 Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    connection.end();
  }
}

// Run migration
migrateDatabase(); 