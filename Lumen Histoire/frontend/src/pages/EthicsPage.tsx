import React from 'react';

const EthicsPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Nguyên tắc Đạo đức Nghề nghiệp</h1>
          <p className="mt-4 text-xl text-gray-600">Cam kết của chúng tôi về sự chuyên nghiệp, trách nhiệm và tôn trọng.</p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-10 text-gray-700">
          <p className="text-lg leading-relaxed">
            Tại Lumen Histoire, chúng tôi tuân thủ nghiêm ngặt các nguyên tắc đạo đức nghề nghiệp trong lĩnh vực tâm lý học, được xây dựng dựa trên các chuẩn mực quốc tế và quy định của pháp luật Việt Nam. Cam kết này đảm bảo rằng mọi khách hàng đều nhận được sự chăm sóc tốt nhất trong một môi trường an toàn, tin cậy và tôn trọng.
          </p>

          {[ // Array of principles
            { title: 'Tôn trọng phẩm giá và quyền con người', description: 'Chúng tôi tôn trọng sự đa dạng, quyền tự quyết và giá trị riêng của mỗi cá nhân, không phân biệt tuổi tác, giới tính, dân tộc, tôn giáo, xu hướng tính dục hay tình trạng kinh tế.', icon: '🤝' },
            { title: 'Năng lực chuyên môn', description: 'Chúng tôi duy trì và nâng cao năng lực chuyên môn thông qua việc học tập liên tục, cập nhật kiến thức và kỹ năng mới nhất. Chỉ cung cấp các dịch vụ nằm trong phạm vi năng lực và kinh nghiệm của mình.', icon: '🎓' },
            { title: 'Tính toàn vẹn và trung thực', description: 'Chúng tôi hành động một cách trung thực, khách quan và có trách nhiệm trong mọi hoạt động nghề nghiệp. Tránh xung đột lợi ích và luôn đặt lợi ích của khách hàng lên hàng đầu.', icon: '💎' },
            { title: 'Bảo mật thông tin', description: 'Chúng tôi cam kết bảo mật tuyệt đối mọi thông tin cá nhân và nội dung trao đổi của khách hàng, trừ những trường hợp được quy định bởi pháp luật (như nguy cơ gây hại cho bản thân hoặc người khác).' , icon: '🔒'},
            { title: 'Trách nhiệm xã hội', description: 'Chúng tôi ý thức được trách nhiệm của mình đối với cộng đồng và xã hội, đóng góp vào việc nâng cao nhận thức và sức khỏe tinh thần chung.', icon: '🌍' },
          ].map((principle, index) => (
            <div key={index} className="p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                 <span className="text-2xl mr-3">{principle.icon}</span> 
                 {principle.title}
              </h3>
              <p className="text-sm leading-relaxed">{principle.description}</p>
            </div>
          ))}

           <p className="text-center text-gray-500 italic mt-10">
             Những nguyên tắc này là nền tảng cho mọi hoạt động của chúng tôi, nhằm mang lại sự hỗ trợ tâm lý hiệu quả và đáng tin cậy nhất.
           </p>
        </div>
      </section>
    </div>
  );
};

export default EthicsPage; 