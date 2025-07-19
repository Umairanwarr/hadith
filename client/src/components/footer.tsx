import logoPath from "@assets/logo (1)_1752944342261.png";

export default function Footer() {
  return (
    <footer className="bg-[hsl(158,40%,34%)] text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={logoPath} 
                alt="شعار الجامعة" 
                className="h-12 w-12 object-contain" 
              />
              <div>
                <h5 className="font-amiri font-bold">جامعة الإمام الزُّهري</h5>
                <p className="text-sm text-green-200">لإعداد علماء الحديث</p>
              </div>
            </div>
            <p className="text-green-200 text-sm leading-relaxed">
              منصة تعليمية متخصصة في علوم الحديث النبوي الشريف، تهدف إلى إعداد جيل من المحدثين المتميزين.
            </p>
          </div>
          
          
          
          <div>
            <h6 className="font-semibold mb-4">خدمات الطلاب</h6>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-green-200 hover:text-white">المكتبة الرقمية</a></li>
              <li><a href="#" className="text-green-200 hover:text-white">الدعم الفني</a></li>
              <li><a href="#" className="text-green-200 hover:text-white">التقويم الأكاديمي</a></li>
              <li><a href="#" className="text-green-200 hover:text-white">الأسئلة الشائعة</a></li>
            </ul>
          </div>
          
          <div>
            <h6 className="font-semibold mb-4">تواصل معنا</h6>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <i className="fas fa-envelope"></i>
                <span className="text-green-200">info@zuhriuniversity.edu</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-phone"></i>
                <span className="text-green-200">+966 11 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-map-marker-alt"></i>
                <span className="text-green-200">الرياض، المملكة العربية السعودية</span>
              </li>
            </ul>
            
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700">
                <i className="fab fa-twitter text-sm"></i>
              </a>
              <a href="#" className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700">
                <i className="fab fa-youtube text-sm"></i>
              </a>
              <a href="#" className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700">
                <i className="fab fa-telegram text-sm"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-green-600 mt-8 pt-6 text-center">
          <p className="text-green-200 text-sm">© 2024 جامعة الإمام الزُّهري. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
