import React from "react";
import { Link } from "react-router-dom"; // Import Link for routing if needed

const Homepage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* 1. Hero Section */}
      <section
        className="relative text-gray-700 py-16 px-4 sm:py-24 lg:py-32 flex items-center justify-center"
        style={{ height: "50vh" }}
      >
        <img
          src="/banner.jpg"
          alt="Banner"
          className="absolute inset-0 w-full h-full object-contain object-center"
          style={{ zIndex: 0 }}
        />
        <div
          className="absolute inset-0 bg-white opacity-10"
          style={{ zIndex: 1 }}
        ></div>
        {/* Nội dung khác nếu có, đặt zIndex cao hơn */}
      </section>

      {/* 2. Core Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {/* Value 1 - Research */}
          <div>
            <img
              src="https://mindcare.vn/wp-content/uploads/2020/04/nghien-cuu-phat-trien.png"
              alt="Nghiên cứu phát triển icon"
              className="mx-auto mb-4 h-20 w-20 object-cover"
            />
            <h3 className="text-xl font-semibold text-green-700 mb-2">
              Nghiên cứu phát triển
            </h3>
            <p className="text-gray-600 text-sm">
              Chúng tôi kết nối các nghiên cứu và phát triển lĩnh vực tâm lý
              học, ứng dụng khoa học công nghệ trong đánh giá trị liệu, tìm ra
              những phương pháp tốt hơn chăm sóc sức khoẻ tinh thần cho cộng
              đồng.
            </p>
          </div>
          {/* Value 2 - Counseling */}
          <div>
            <img
              src="https://mindcare.vn/wp-content/uploads/2020/04/tham-van-va-tri-lieu.png"
              alt="Tham vấn, trị liệu tâm lý icon"
              className="mx-auto mb-4 h-20 w-20 object-cover"
            />
            <h3 className="text-xl font-semibold text-green-700 mb-2">
              Tham vấn, trị liệu tâm lý
            </h3>
            <p className="text-gray-600 text-sm">
              Lumen Histoire thực hiện tham vấn tâm lý trực tiếp, trực tuyến cho
              các cá nhân, cặp đôi, gia đình và các nhóm có nhận dạng gặp những
              khó khăn, vướng mắc cần tháo gỡ...
            </p>
          </div>
          {/* Value 3 - Training */}
          <div>
            <img
              src="https://mindcare.vn/wp-content/uploads/2020/04/dao-tao-tam-ly-hoc.png"
              alt="Đào tạo tâm lý và ứng dụng icon"
              className="mx-auto mb-4 h-20 w-20 object-cover"
            />
            <h3 className="text-xl font-semibold text-green-700 mb-2">
              Đào tạo tâm lý và ứng dụng
            </h3>
            <p className="text-gray-600 text-sm">
              Các chương trình đào tạo giúp nâng cao năng lực cho các chuyên
              viên tham vấn tâm lý và các khoá học cho cộng đồng về tâm lý và
              ứng dụng trong cuộc sống thực tế.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <img
              src="https://mindcare.vn/wp-content/uploads/2020/04/loi-gioi-thieu-img.jpg"
              alt="Sứ mệnh vì triệu người Việt Nam hạnh phúc"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-green-700 mb-4">
              Sứ mệnh vì triệu người Việt Nam hạnh phúc hơn mỗi ngày!
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              Đội ngũ Lumen Histoire Việt Nam với các chuyên gia tâm huyết nhằm
              tháo gỡ mọi khó khăn tâm lý, giúp bạn đọc vị chính mình và những
              người thân xung quanh.
            </p>
            <p className="text-gray-600 text-sm">
              Hãy sẻ chia với chúng tôi bất kỳ khi nào bạn cần, chúng tôi luôn
              sẵn lòng lắng nghe bạn!
            </p>
          </div>
        </div>
      </section>

      {/* 4. Why Choose Us Section - Updated content and Unsplash images */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          TẠI SAO NÊN CHỌN LUMEN HISTOIRE
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center">
          {/* Reason 1 - Experienced Experts */}
          <div>
            <img
              src="https://mindcare.vn/wp-content/uploads/2020/04/1-5-300x300.png"
              alt="Chuyên gia giàu kinh nghiệm icon"
              className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
            />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Chuyên gia giàu kinh nghiệm
            </h3>
            <p className="text-gray-600 text-sm">
              Chuyên gia của chúng tôi là những nhà tâm lý có trình độ cử nhân,
              thạc sĩ, tiến sĩ... có nhiều năm kinh nghiệm trong lĩnh vực, luôn
              tận tuỵ, yêu nghề và giàu tình yêu thương.
            </p>
          </div>
          {/* Reason 2 - Priority Scheduling */}
          <div>
            <img
              src="https://mindcare.vn/wp-content/uploads/2020/04/2-5-300x300.png"
              alt="Đặt lịch hẹn ưu tiên icon"
              className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
            />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Đặt lịch hẹn ưu tiên với chuyên gia riêng
            </h3>
            <p className="text-gray-600 text-sm">
              Bạn được lựa chọn một chuyên gia riêng đồng hành cùng mình trong
              suốt quá trình một cách an toàn, đặt lịch hẹn ưu tiên để không làm
              mất thời gian của bạn.
            </p>
          </div>
          {/* Reason 3 - Professionalism */}
          <div>
            <img
              src="https://mindcare.vn/wp-content/uploads/2020/04/3-2-300x300.png"
              alt="Chuyên nghiệp, tận tâm icon"
              className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
            />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Chuyên nghiệp, tận tâm, trách nhiệm
            </h3>
            <p className="text-gray-600 text-sm">
              Đội ngũ của chúng tôi luôn sẵn sàng phục vụ 24/7 khi bạn có nhu
              cầu hỗ trợ một cách tận tình nhất.
            </p>
          </div>
          {/* Reason 4 - Confidentiality */}
          <div>
            <img
              src="https://mindcare.vn/wp-content/uploads/2020/04/4-2-300x300.png"
              alt="Bảo mật thông tin icon"
              className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
            />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Bảo mật thông tin tuyệt đối của khách hàng
            </h3>
            <p className="text-gray-600 text-sm">
              Đây là nguyên tắc bắt buộc phải tuân thủ khi hành nghề tâm lý, mọi
              thông tin tư vấn, đời tư của khách hàng luôn được bảo mật tuyệt
              đối.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Final CTA Section - Updated button style */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 text-center bg-white">
        <p className="max-w-3xl mx-auto text-gray-700 mb-6">
          Bằng tâm huyết của mình, chúng tôi hi vọng sẽ cùng chung tay giúp đỡ
          được nhiều cá nhân, gia đình,... vượt qua được những khó khăn, vướng
          mắc để hạnh phúc hơn trong cuộc sống! Chúng tôi luôn luôn sẵn sàng
          lắng nghe và sẻ chia!
        </p>
        <Link
          to="/dich-vu"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-block bg-green-200 text-green-800 font-semibold py-3 px-8 rounded-full hover:bg-green-300 hover:text-green-900 transition-colors duration-200 shadow-sm"
        >
          Đặt lịch tư vấn
        </Link>
      </section>
    </div>
  );
};

export default Homepage;
