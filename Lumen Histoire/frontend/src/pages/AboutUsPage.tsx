import React from 'react';
// If you install react-icons, uncomment the line below
// import { FaBrain, FaHeartbeat, FaLock, FaUsers } from 'react-icons/fa';

const AboutUsPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-100 via-teal-100 to-blue-100 py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Về Chúng Tôi - Lumen Histoire</h1>
          <p className="mt-4 text-xl text-gray-600">Hành trình kiến tạo hạnh phúc và sức khỏe tinh thần cho cộng đồng.</p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-16 lg:space-y-20">

          {/* Section 1: Our Story/Mission */}
          <div className="md:flex md:items-center md:gap-12 lg:gap-16">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                alt="Our team collaborating on a project"
                className="rounded-lg shadow-xl w-full object-cover aspect-[4/3]"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Câu chuyện của chúng tôi</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Lumen Histoire được thành lập với niềm tin rằng mọi cá nhân đều xứng đáng có được một cuộc sống tinh thần khỏe mạnh và hạnh phúc. Chúng tôi nhận thấy nhu cầu ngày càng tăng về các dịch vụ hỗ trợ tâm lý chuyên nghiệp, dễ tiếp cận và đáng tin cậy tại Việt Nam.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Từ đó, đội ngũ các chuyên gia tâm huyết đã cùng nhau xây dựng Lumen Histoire, với sứ mệnh cung cấp các giải pháp toàn diện, dựa trên nghiên cứu khoa học và thực tiễn, nhằm nâng cao chất lượng cuộc sống tinh thần cho mỗi người Việt.
              </p>
            </div>
          </div>

          {/* Section 2: Our Values - Enhanced Styling */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-10 lg:mb-12">Giá trị cốt lõi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
              {/* Value Card 1: Expertise */}
              <div className="p-6 lg:p-8 bg-white rounded-xl shadow-lg border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                 <div className="mx-auto mb-4 w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                   {/* Replace with actual icon component if available */}
                   {/* <FaBrain className="text-green-600 text-2xl" /> */}
                   <span className="text-2xl" role="img" aria-label="brain">🧠</span>
                 </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Chuyên môn</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Đội ngũ chuyên gia giàu kinh nghiệm, được đào tạo bài bản và không ngừng cập nhật kiến thức.</p>
              </div>
               {/* Value Card 2: Dedication */}
               <div className="p-6 lg:p-8 bg-white rounded-xl shadow-lg border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                 <div className="mx-auto mb-4 w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                   {/* Replace with actual icon component if available */}
                   {/* <FaHeartbeat className="text-blue-600 text-2xl" /> */}
                   <span className="text-2xl" role="img" aria-label="heart">❤️</span>
                 </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Tận tâm</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Luôn lắng nghe, thấu hiểu và đồng hành cùng khách hàng với sự tôn trọng và chu đáo.</p>
              </div>
               {/* Value Card 3: Confidentiality */}
               <div className="p-6 lg:p-8 bg-white rounded-xl shadow-lg border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                 <div className="mx-auto mb-4 w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                   {/* Replace with actual icon component if available */}
                   {/* <FaLock className="text-purple-600 text-2xl" /> */}
                   <span className="text-2xl" role="img" aria-label="lock">🔒</span>
                 </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Bảo mật</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Cam kết bảo mật tuyệt đối mọi thông tin của khách hàng theo đúng nguyên tắc đạo đức nghề nghiệp.</p>
              </div>
            </div>
          </div>

          {/* Section 3: Meet the Team (NEW) */}
          <div className="text-center">
             <h2 className="text-3xl font-bold text-gray-800 mb-10 lg:mb-12">Gặp gỡ đội ngũ chuyên gia</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-10">
               {/* Team Member Card 1 */}
               <div className="text-center group">
                 <img
                   src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80" // Unsplash image
                   alt="Portrait of Nguyễn Văn A"
                   className="w-32 h-32 mx-auto rounded-full shadow-lg mb-4 object-cover border-4 border-transparent group-hover:border-blue-200 transition-all duration-300"
                 />
                 <h4 className="text-lg font-semibold text-gray-800">Nguyễn Văn A</h4>
                 <p className="text-sm text-gray-500">Chuyên gia Tâm lý Trị liệu</p>
               </div>
               {/* Team Member Card 2 */}
               <div className="text-center group">
                 <img
                   src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80" // Unsplash image
                   alt="Portrait of Trần Thị B"
                   className="w-32 h-32 mx-auto rounded-full shadow-lg mb-4 object-cover border-4 border-transparent group-hover:border-teal-200 transition-all duration-300"
                 />
                 <h4 className="text-lg font-semibold text-gray-800">Trần Thị B</h4>
                 <p className="text-sm text-gray-500">Chuyên gia Tư vấn Hôn nhân</p>
               </div>
               {/* Team Member Card 3 */}
               <div className="text-center group">
                 <img
                   src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80" // Unsplash image
                   alt="Portrait of Lê Văn C"
                   className="w-32 h-32 mx-auto rounded-full shadow-lg mb-4 object-cover border-4 border-transparent group-hover:border-yellow-200 transition-all duration-300"
                 />
                 <h4 className="text-lg font-semibold text-gray-800">Lê Văn C</h4>
                 <p className="text-sm text-gray-500">Chuyên gia Tâm lý Trẻ em</p>
               </div>
               {/* Team Member Card 4 */}
               <div className="text-center group">
                 <img
                   src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80" // Unsplash image
                   alt="Portrait of Phạm Thị D"
                   className="w-32 h-32 mx-auto rounded-full shadow-lg mb-4 object-cover border-4 border-transparent group-hover:border-orange-200 transition-all duration-300"
                 />
                 <h4 className="text-lg font-semibold text-gray-800">Phạm Thị D</h4>
                 <p className="text-sm text-gray-500">Chuyên gia Tâm lý Tổ chức</p>
               </div>
             </div>
             <div className="mt-12">
                <a
                   href="/chuyen-gia"
                   className="inline-block bg-green-100 px-8 py-3 rounded-[16px] font-medium hover:bg-green-200 transition-colors shadow hover:shadow-md text-base"
                 >
                   Xem tất cả chuyên gia
                 </a>
             </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default AboutUsPage; 