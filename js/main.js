/**
 * CoffeeShop - Main JavaScript Application
 * Handles Data Loading (CSV / Fallback), Carousel Slider, Product Filtering,
 * Search, Sorting, Mini Cart Drawer, Quick View Modal, and Contact Form.
 */

// Global State
const AppState = {
  categories: [],
  products: [],
  cart: [],
  currentUser: null,
  selectedCategory: 0,
  searchQuery: '',
  sortBy: 'default',
  currentSlide: 0,
  carouselTimer: null
};

// Embedded Fallback Dataset (Used when running via file:// protocol where fetch is blocked by browser CORS)
const FALLBACK_DATASET = {
  "categories": [
    {
      "id": 1,
      "name": "Cà phê",
      "description": "Sự kết hợp hoàn hảo giữa hạt cà phê Robusta & Arabica thượng hạng được trồng trên những vùng cao nguyên Việt Nam màu mỡ, qua những bí quyết rang xay độc đáo, Highlands Coffee chúng tôi tự hào giới thiệu những dòng sản phẩm Cà phê mang hương vị đậm đà và tinh tế."
    },
    {
      "id": 2,
      "name": "Freeze",
      "description": "Sảng khoái với thức uống đá xay phong cách Việt. Freeze là thức uống đá xay mát lạnh được pha chế từ những nguyên liệu thuần túy của Việt Nam."
    },
    {
      "id": 3,
      "name": "Trà",
      "description": "Hương vị tự nhiên, thơm ngon của Trà Việt với phong cách hiện đại tại Highlands Coffee sẽ giúp bạn gợi mở vị giác của bản thân và tận hưởng một cảm giác thật khoan khoái, tươi mới."
    },
    {
      "id": 4,
      "name": "Bánh ngọt",
      "description": ""
    }
  ],
  "products": [
    {
      "id": 1,
      "name": "PHIN ĐEN ĐÁ",
      "price": 29000,
      "image": "images/products/HLC_New_logo_5.1_Products__PHIN_DEN_DA.jpg",
      "description": "<p><span style=\"color:hsl(240, 75%, 60%);\"><strong>Dành cho những tín đồ cà phê đích thực!&nbsp;</strong></span></p><p>Hương vị cà phê truyền thống được phối trộn độc đáo tại <span class=\"text-big\" style=\"color:hsl(0, 75%, 60%);\"><strong>CoffeeShop</strong></span>. Cà phê đậm đà pha hoàn toàn từ Phin, cho thêm 1 thìa đường, một ít đá viên mát lạnh, tạo nên <span class=\"text-big\"><strong>Phin Đen Đá</strong></span> mang vị cà phê đậm đà chất Phin.</p>",
      "published_date": "2024-12-02 15:05:43",
      "category_id": 1
    },
    {
      "id": 2,
      "name": "MOCHA MACCHIATO",
      "price": 69000,
      "image": "images/products/HLC_New_logo_5.1_Products__MOCHA.jpg",
      "description": "Một thức uống yêu thích được kết hợp bởi giữa sốt sô cô la ngọt ngào, sữa tươi và đặc biệt là cà phê espresso đậm đà mang thương hiệu Highlands Coffee. Bạn có thể tùy thích lựa chọn uống nóng hoặc dùng chung với đá.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 3,
      "name": "LATTE",
      "price": 65000,
      "image": "images/products/HLC_New_logo_5.1_Products__LATTE_1.jpg",
      "description": "Ly cà phê sữa ngọt ngào đến khó quên! Với một chút nhẹ nhàng hơn so với Cappuccino, Latte của chúng tôi bắt đầu với cà phê espresso, sau đó thêm sữa tươi và bọt sữa một cách đầy nghệ thuật. Bạn có thể tùy thích lựa chọn uống nóng hoặc dùng chung với đá.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 4,
      "name": "CAPPUCCINO",
      "price": 65000,
      "image": "images/products/HLC_New_logo_5.1_Products__CAPPUCINO.jpg",
      "description": "Ly cà phê sữa đậm đà thời thượng! Một chút đậm đà hơn so với Latte, Cappuccino của chúng tôi bắt đầu với cà phê espresso, sau đó thêm một lượng tương đương giữa sữa tươi và bọt sữa cho thật hấp dẫn. Bạn có thể tùy thích lựa chọn uống nóng hoặc dùng chung với đá.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 5,
      "name": "AMERICANO",
      "price": 45000,
      "image": "images/products/HLC_New_logo_5.1_Products__AMERICANO_NONG.jpg",
      "description": "Americano tại Highlands Coffee là sự kết hợp giữa cà phê espresso thêm vào nước đun sôi. Bạn có thể tùy thích lựa chọn uống nóng hoặc dùng chung với đá.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 6,
      "name": "ESPRESSO",
      "price": 45000,
      "image": "images/products/HLC_New_logo_5.1_Products__EXPRESSO.jpg",
      "description": "Đích thực là ly cà phê espresso ngon đậm đà! Được chiết xuất một cách hoàn hảo từ loại cà phê rang được phối trộn độc đáo từ những hạt cà phê Robusta và Arabica chất lượng hảo hạng.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 7,
      "name": "PHIN SỮA ĐÁ",
      "price": 29000,
      "image": "images/products/HLC_New_logo_5.1_Products__PHIN_SUADA.jpg",
      "description": "Hương vị cà phê Việt Nam đích thực! Từng hạt cà phê hảo hạng được chọn bằng tay, phối trộn độc đáo giữa hạt Robusta từ cao nguyên Việt Nam, thêm Arabica thơm lừng. Cà phê được pha từ Phin truyền thống, hoà cùng sữa đặc sánh và thêm vào chút đá tạo nên ly Phin Sữa Đá – Đậm Đà Chất Phin.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 8,
      "name": "PHIN ĐEN NÓNG",
      "price": 29000,
      "image": "images/products/HLC_PHIN_DEN_NONG.jpg",
      "description": "Dành cho những tín đồ cà phê đích thực! Hương vị cà phê truyền thống được phối trộn độc đáo tại Highlands. Cà phê đậm đà pha từ Phin, cho thêm 1 thìa đường, mang đến vị cà phê đậm đà chất Phin.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 9,
      "name": "PHIN SỮA NÓNG",
      "price": 29000,
      "image": "images/products/HLC__PHIN_SUA_NONG.jpg",
      "description": "Hương vị cà phê Việt Nam đích thực! Từng hạt cà phê hảo hạng được chọn bằng tay, phối trộn độc đáo giữa hạt Robusta từ cao nguyên Việt Nam, thêm Arabica thơm lừng. Kết hợp với nước sôi từng giọt cà phê được chiết xuất từ Phin truyền thống, hoà cùng sữa đặc sánh tạo nên ly Phin Sữa Nóng – Đậm đà chất Phin.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 10,
      "name": "PHINDI CASSIA",
      "price": 55000,
      "image": "images/products/Phindi_Cassia_Highlands_products_Image1.jpg",
      "description": "Với chất phin êm ái, hương vị cà phê Việt Nam hiện đại kết hợp cùng hương quế nhẹ nhàng và thạch cà phê hấp dẫn.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 11,
      "name": "PHINDI CHOCO",
      "price": 45000,
      "image": "images/products/HLC_New_logo_5.1_Products__PHINDI_CHOCO.jpg",
      "description": "PhinDi Choco - Cà phê Phin thế hệ mới với chất Phin êm hơn, kết hợp cùng Choco ngọt tan mang đến hương vị mới lạ, không thể hấp dẫn hơn!",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 12,
      "name": "PHINDI HẠNH NHÂN",
      "price": 45000,
      "image": "images/products/HLC_New_logo_5.1_Products__PHINDI_HANH_NHAN.jpg",
      "description": "PhinDi Hạnh Nhân - Cà phê Phin thế hệ mới với chất Phin êm hơn, kết hợp cùng Hạnh nhân thơm bùi mang đến hương vị mới lạ, không thể hấp dẫn hơn!",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 13,
      "name": "PHINDI KEM SỮA",
      "price": 45000,
      "image": "images/products/HLC_New_logo_5.1_Products__PHINDI_KEM_SUA.jpg",
      "description": "PhinDi Kem Sữa - Cà phê Phin thế hệ mới với chất Phin êm hơn, kết hợp cùng Kem Sữa béo ngậy mang đến hương vị mới lạ, không thể hấp dẫn hơn!",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 14,
      "name": "BẠC XỈU ĐÁ",
      "price": 29000,
      "image": "images/products/HLC_New_logo_5.1_Products__BAC_XIU.jpg",
      "description": "Nếu Phin Sữa Đá dành cho các bạn đam mê vị đậm đà, thì Bạc Xỉu Đá là một sự lựa chọn nhẹ “đô\" cà phê nhưng vẫn thơm ngon, chất lừ không kém!",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 15,
      "name": "CARAMEL MACCHIATO",
      "price": 69000,
      "image": "images/products/HLC_New_logo_5.1_Products__CARAMEL_MACCHIATTO.jpg",
      "description": "Thỏa mãn cơn thèm ngọt! Ly cà phê Caramel Macchiato bắt đầu từ dòng sữa tươi và lớp bọt sữa béo ngậy, sau đó hòa quyện cùng cà phê espresso đậm đà và sốt caramel ngọt ngào. Thông qua bàn tay điêu luyện của các chuyên gia pha chế, mọi thứ hoàn toàn được nâng tầm thành nghệ thuật! Bạn có thể tùy thích lựa chọn uống nóng hoặc dùng chung với đá.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 16,
      "name": "COLD BREW ĐÀO",
      "price": 79000,
      "image": "images/products/Cold_Brew_Peach.jpg",
      "description": "",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 17,
      "name": "COLD BREW",
      "price": 69000,
      "image": "images/products/Cold_Brew.jpg",
      "description": "",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 18,
      "name": "PHINDI CASSIA",
      "price": 69000,
      "image": "images/products/PhinDi_Cassia.jpg",
      "description": "",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 19,
      "name": "BẠC XỈU CULI",
      "price": 55000,
      "image": "images/products/Bac_Xiu.jpg",
      "description": "",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 20,
      "name": "PHIN CULI SỮA ĐÁ",
      "price": 55000,
      "image": "images/products/Phin_Sua_Da.jpg",
      "description": "",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 21,
      "name": "PHIN CULI ĐEN ĐÁ",
      "price": 49000,
      "image": "images/products/Phin_Den_Da.jpg",
      "description": "",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 22,
      "name": "CITRUS COFFEE DETONIC",
      "price": 72090,
      "image": "images/products/Citrus_Cafe_De_Tonic.jpg",
      "description": "",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 23,
      "name": "COLD BREW MILK FOAM",
      "price": 79000,
      "image": "images/products/Cold_Brew_Milk_Foam.jpg",
      "description": "",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 1
    },
    {
      "id": 24,
      "name": "FREEZE SÔ-CÔ-LA",
      "price": 55000,
      "image": "images/products/HLC_New_logo_5.1_Products__FREEZE_CHOCO.jpg",
      "description": "Thiên đường đá xay sô cô la! Từ những thanh sô cô la Việt Nam chất lượng được đem xay với đá cho đến khi mềm mịn, sau đó thêm vào thạch sô cô la dai giòn, ở trên được phủ một lớp kem whip beo béo và sốt sô cô la ngọt ngào. Tạo thành Freeze Sô-cô-la ngon mê mẩn chinh phục bất kì ai!",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 2
    },
    {
      "id": 25,
      "name": "COOKIES & CREAM",
      "price": 55000,
      "image": "images/products/HLC_New_logo_5.1_Products__COOKIES_FREEZE.jpg",
      "description": "Một thức uống ngon lạ miệng bởi sự kết hợp hoàn hảo giữa cookies sô cô la giòn xốp cùng hỗn hợp sữa tươi cùng sữa đặc đem say với đá viên, và cuối cùng không thể thiếu được chính là lớp kem whip mềm mịn cùng cookies sô cô la say nhuyễn.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 2
    },
    {
      "id": 26,
      "name": "CARAMEL PHIN FREEZE",
      "price": 55000,
      "image": "images/products/HLC_New_logo_5.1_Products__CARAMEL_FREEZE_PHINDI.jpg",
      "description": "Thơm ngon khó cưỡng! Được kết hợp từ cà phê truyền thống chỉ có tại Highlands Coffee, cùng với caramel, thạch cà phê và đá xay mát lạnh. Trên cùng là lớp kem tươi thơm béo và caramel ngọt ngào. Món nước phù hợp trong những cuộc gặp gỡ bạn bè, bởi sự ngọt ngào thường mang mọi người xích lại gần nhau.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 2
    },
    {
      "id": 27,
      "name": "CLASSIC PHIN FREEZE",
      "price": 55000,
      "image": "images/products/HLC_New_logo_5.1_Products__CLASSIC_FREEZE_PHINDI.jpg",
      "description": "Thơm ngon đậm đà! Được kết hợp từ cà phê pha Phin truyền thống chỉ có tại Highlands Coffee, cùng với thạch cà phê và đá xay mát lạnh. Trên cùng là lớp kem tươi thơm béo và bột ca cao đậm đà. Món nước hoàn hảo để khởi đầu câu chuyện cùng bạn bè.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 2
    },
    {
      "id": 28,
      "name": "FREEZE TRÀ XANH",
      "price": 55000,
      "image": "images/products/HLC_New_logo_5.1_Products__FREEZE_TRA_XANH.jpg",
      "description": "Thức uống rất được ưa chuộng! Trà xanh thượng hạng từ cao nguyên Việt Nam, kết hợp cùng đá xay, thạch trà dai dai, thơm ngon và một lớp kem dày phủ lên trên vô cùng hấp dẫn. Freeze Trà Xanh thơm ngon, mát lạnh, chinh phục bất cứ ai!",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 2
    },
    {
      "id": 29,
      "name": "TRÀ THẠCH VẢI",
      "price": 45000,
      "image": "images/products/HLC_New_logo_5.1_Products__TRA_TACH_VAI.jpg",
      "description": "Một sự kết hợp thú vị giữa trà đen, những quả vải thơm ngon và thạch giòn khó cưỡng, mang đến thức uống tuyệt hảo!",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 3
    },
    {
      "id": 30,
      "name": "TRÀ SEN VÀNG (CỦ NĂNG)",
      "price": 45000,
      "image": "images/products/HLC_New_logo_5.1_Products__TRA_SEN_VANG_CU_NANG.jpg",
      "description": "Thức uống chinh phục những thực khách khó tính! Sự kết hợp độc đáo giữa trà Ô long, hạt sen thơm bùi và củ năng giòn tan. Thêm vào chút sữa sẽ để vị thêm ngọt ngào.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 3
    },
    {
      "id": 31,
      "name": "TRÀ SEN VÀNG (SEN)",
      "price": 45000,
      "image": "images/products/HLC_New_logo_5.1_Products__TSV.jpg",
      "description": "",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 3
    },
    {
      "id": 32,
      "name": "TRÀ XANH ĐẬU ĐỎ",
      "price": 45000,
      "image": "images/products/HLC_New_logo_5.1_Products__TRA_XANH_DAU_DO.jpg",
      "description": "",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 3
    },
    {
      "id": 33,
      "name": "TRÀ THẠCH ĐÀO",
      "price": 45000,
      "image": "images/products/HLC_New_logo_5.1_Products__TRA_THANH_DAO-09.jpg",
      "description": "Vị trà đậm đà kết hợp cùng những miếng đào thơm ngon mọng nước cùng thạch đào giòn dai. Thêm vào ít sữa để gia tăng vị béo.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 3
    },
    {
      "id": 34,
      "name": "TRÀ THANH ĐÀO",
      "price": 45000,
      "image": "images/products/HLC_New_logo_5.1_Products__TRA_THANH_DAO-08.jpg",
      "description": "Một trải nghiệm thú vị khác! Sự hài hòa giữa vị trà cao cấp, vị sả thanh mát và những miếng đào thơm ngon mọng nước sẽ mang đến cho bạn một thức uống tuyệt vời.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 3
    },
    {
      "id": 35,
      "name": "SET TRÀ CAO CẤP (TÙY CHỌN TRÀ)",
      "price": 128790,
      "image": "images/products/Hot_Tea_Set.jpg",
      "description": "",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 3
    },
    {
      "id": 36,
      "name": "TRÀ QUẢ MỌNG ANH ĐÀO",
      "price": 79000,
      "image": "images/products/Tra_Qua_Mong_Anh_Dao.jpg",
      "description": "",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 3
    },
    {
      "id": 37,
      "name": "TRÀ ỔI HỒNG",
      "price": 79000,
      "image": "images/products/Tra_Oi_Hong.jpg",
      "description": "",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 3
    },
    {
      "id": 38,
      "name": "BÁNH CARAMEL PHÔ MAI",
      "price": 35000,
      "image": "images/products/CARAMELPHOMAI.jpg",
      "description": "Ngon khó cưỡng! Bánh phô mai thơm béo được phủ bằng lớp caramel ngọt ngào.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 4
    },
    {
      "id": 39,
      "name": "BÁNH TIRAMISU",
      "price": 35000,
      "image": "images/products/TIRAMISU.jpg",
      "description": "Tiramisu thơm béo, làm từ ca-cao Việt Nam đậm đà, kết hợp với phô mai ít béo, vani và chút rum nhẹ nhàng.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 4
    },
    {
      "id": 40,
      "name": "BÁNH CHUỐI",
      "price": 29000,
      "image": "images/products/BANHCHUOI.jpg",
      "description": "Bánh chuối truyền thống, sự kết hợp của 100% chuối tươi và nước cốt dừa Việt Nam.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 4
    },
    {
      "id": 41,
      "name": "BÁNH MOUSSE CACAO",
      "price": 35000,
      "image": "images/products/MOUSSECACAO.png",
      "description": "Bánh Mousse Ca Cao, là sự kết hợp giữa ca-cao Việt Nam đậm đà cùng kem tươi.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 4
    },
    {
      "id": 42,
      "name": "BÁNH MOUSSE ĐÀO",
      "price": 35000,
      "image": "images/products/MOUSSEDAO.png",
      "description": "Một sự kết hợp khéo léo giữa kem và lớp bánh mềm, được phủ lên trên vài lát đào ngon tuyệt.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 4
    },
    {
      "id": 43,
      "name": "BÁNH SÔ-CÔ-LA HIGHLANDS",
      "price": 35000,
      "image": "images/products/SOCOLAHL.png",
      "description": "Một chiếc bánh độc đáo! Sô cô la ngọt ngào và kem tươi béo ngậy, được phủ thêm một lớp sô cô la mỏng bên trên cho thêm phần hấp dẫn.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 4
    },
    {
      "id": 44,
      "name": "BÁNH PHÔ MAI CÀ PHÊ",
      "price": 29000,
      "image": "images/products/PHOMAICAPHE.jpg",
      "description": "Làm từ cà phê truyền thống của Highlands, kết hợp với phô mai thơm ngon! Chiếc bánh phù hợp đi cùng với bất cứ món cà phê nào!",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 4
    },
    {
      "id": 45,
      "name": "BÁNH PHÔ MAI CHANH DÂY",
      "price": 29000,
      "image": "images/products/PHOMAICHANHDAY.jpg",
      "description": "Vị béo của phô mai cùng với vị chua của chanh dây, tạo nên chiếc bánh thơm ngon hấp dẫn!",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 4
    },
    {
      "id": 46,
      "name": "BÁNH PHÔ MAI TRÀ XANH",
      "price": 35000,
      "image": "images/products/PHOMAITRAXANH.jpg",
      "description": "Một sự sáng tạo mới mẻ, kết hợp giữa trà xanh đậm đà và phô mai ít béo.",
      "published_date": "2024-12-02 15:05:43.066442",
      "category_id": 4
    }
  ]
};

/* ==========================================================================
   Utility Functions
   ========================================================================== */

/**
 * Format number to Vietnamese Currency (VND)
 * @param {number} amount
 * @returns {string} e.g. "29.000 đ"
 */
function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

/**
 * Clean and strip HTML tags from a string
 * @param {string} html
 * @returns {string}
 */
function stripHtml(html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * RFC 4180 compliant CSV Parser
 * @param {string} text
 * @returns {Array<Array<string>>}
 */
function parseCSV(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let field = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(field.trim());
        field = '';
      } else if (char === '\r' && nextChar === '\n') {
        row.push(field.trim());
        if (row.length > 1 || row[0] !== '') lines.push(row);
        row = [];
        field = '';
        i++;
      } else if (char === '\n' || char === '\r') {
        row.push(field.trim());
        if (row.length > 1 || row[0] !== '') lines.push(row);
        row = [];
        field = '';
      } else {
        field += char;
      }
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field.trim());
    if (row.length > 1 || row[0] !== '') lines.push(row);
  }
  return lines;
}

/**
 * Load Categories and Products from Flask API or CSV files with fallback
 */
async function loadAppData() {
  try {
    let catData = null;
    let prodData = null;

    try {
      const apiCatRes = await fetch('/api/categories');
      if (apiCatRes.ok) {
        catData = await apiCatRes.json();
      }
      const apiProdRes = await fetch('/api/products');
      if (apiProdRes.ok) {
        prodData = await apiProdRes.json();
      }
    } catch (e) {
      // Offline hoặc không chạy trên Flask
    }

    if (catData && prodData && catData.length > 0 && prodData.length > 0) {
      AppState.categories = catData;
      AppState.products = prodData;
      console.log('Successfully loaded data from Flask SQLite backend:', {
        categories: AppState.categories.length,
        products: AppState.products.length
      });
      return;
    }

    const [catResponse, prodResponse] = await Promise.all([
      fetch('data/category.csv'),
      fetch('data/product.csv')
    ]);

    if (!catResponse.ok || !prodResponse.ok) {
      throw new Error('Failed to fetch CSV files, switching to fallback dataset');
    }

    const catText = await catResponse.text();
    const prodText = await prodResponse.text();

    const catRows = parseCSV(catText);
    AppState.categories = catRows.slice(1).map(r => ({
      id: parseInt(r[0]),
      name: r[1],
      description: r[2] || ''
    }));

    const prodRows = parseCSV(prodText);
    AppState.products = prodRows.slice(1).map(r => ({
      id: parseInt(r[0]),
      name: r[1],
      price: parseFloat(r[2]) || 0,
      image: r[3],
      description: r[4] || '',
      published_date: r[5] || '',
      category_id: parseInt(r[6]) || 1
    }));

    console.log('Successfully loaded and parsed CSV data:', {
      categories: AppState.categories.length,
      products: AppState.products.length
    });
  } catch (error) {
    console.warn('Network notice (using embedded dataset for 100% offline & local compatibility):', error.message);
    AppState.categories = FALLBACK_DATASET.categories;
    AppState.products = FALLBACK_DATASET.products;
  }
}

/**
 * Get Category by ID
 */
function getCategoryById(catId) {
  return AppState.categories.find(c => c.id === catId) || { id: 0, name: 'Khác' };
}

/* ==========================================================================
   Shopping Cart Management
   ========================================================================== */

function initCart() {
  const savedCart = localStorage.getItem('coffeeshop_cart');
  if (savedCart) {
    try {
      AppState.cart = JSON.parse(savedCart);
    } catch (e) {
      AppState.cart = [];
    }
  }
  updateCartBadge();
  renderCartDrawer();
}

function saveCart() {
  localStorage.setItem('coffeeshop_cart', JSON.stringify(AppState.cart));
  updateCartBadge();
  renderCartDrawer();
}

function addToCart(productId, quantity = 1) {
  const product = AppState.products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = AppState.cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.qty += quantity;
  } else {
    AppState.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: quantity
    });
  }

  saveCart();
  showToast('Thành công', `Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
}

function updateCartQty(productId, delta) {
  const item = AppState.cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    AppState.cart = AppState.cart.filter(i => i.id !== productId);
  }
  saveCart();
}

function removeFromCart(productId) {
  const item = AppState.cart.find(i => i.id === productId);
  if (!item) return;
  AppState.cart = AppState.cart.filter(i => i.id !== productId);
  saveCart();
  showToast('Thông báo', `Đã xóa "${item.name}" khỏi giỏ hàng.`, 'info');
}

function clearCart() {
  AppState.cart = [];
  saveCart();
}

function updateCartBadge() {
  const count = AppState.cart.reduce((sum, item) => sum + item.qty, 0);
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(b => {
    b.textContent = count;
  });
}

function renderCartDrawer() {
  const drawerBody = document.getElementById('cartDrawerBody');
  const subtotalEl = document.getElementById('cartSubtotal');
  if (!drawerBody) return;

  if (AppState.cart.length === 0) {
    drawerBody.innerHTML = `
      <div style="text-align: center; padding: 50px 10px; color: var(--text-light);">
        <div style="width: 70px; height: 70px; border-radius: 50%; background: var(--bg-surface-secondary); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
          <i class="fas fa-shopping-bag" style="font-size: 2rem; color: var(--accent);"></i>
        </div>
        <h4 style="font-size: 1.2rem; color: var(--text-main); margin-bottom: 6px; font-family: 'Plus Jakarta Sans', sans-serif;">Giỏ hàng của bạn đang trống</h4>
        <p style="font-size: 0.92rem; max-width: 260px; margin: 0 auto 20px;">Hãy khám phá các thức uống thơm ngon và thêm vào giỏ nhé!</p>
        <a href="products.html" class="btn btn-secondary btn-sm" onclick="closeCartDrawer()">
          <i class="fas fa-th-large"></i> Khám phá Thực đơn
        </a>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '0 đ';
    return;
  }

  let total = 0;
  let html = '';

  AppState.cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    html += `
      <div class="cart-item-row">
        <div class="cart-item-thumb">
          <img src="${item.image}" alt="${item.name}" onerror="this.src='images/products/HLC_New_logo_5.1_Products__PHIN_DEN_DA.jpg'">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.name}</h4>
          <div class="cart-item-price">${formatVND(item.price)}</div>
          <div class="cart-item-bottom">
            <div class="qty-control">
              <button class="qty-btn" onclick="updateCartQty(${item.id}, -1)">-</button>
              <span class="qty-input" style="line-height: 44px;">${item.qty}</span>
              <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Xóa món">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  drawerBody.innerHTML = html;
  if (subtotalEl) subtotalEl.textContent = formatVND(total);
}

function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartDrawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartDrawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   Toast Notifications
   ========================================================================== */

function showToast(title, message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'danger' ? 'toast-danger' : ''}`;
  
  let iconClass = 'fa-check-circle';
  if (type === 'info') iconClass = 'fa-info-circle';
  if (type === 'danger') iconClass = 'fa-exclamation-circle';

  toast.innerHTML = `
    <i class="fas ${iconClass}"></i>
    <div class="toast-msg">
      <h5>${title}</h5>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      toast.remove();
    }, 350);
  }, 3400);
}

/* ==========================================================================
   Product Detail Modal (Quick View)
   ========================================================================== */

function openQuickView(productId) {
  const product = AppState.products.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('quickViewModal');
  const modalContent = document.getElementById('modalProductDetails');
  if (!modal || !modalContent) return;

  const category = getCategoryById(product.category_id);
  const cleanDescription = stripHtml(product.description) || 
    'Thức uống được pha chế theo công thức chuẩn hương vị đậm đà, mang lại trải nghiệm tuyệt vời cho mọi khoảnh khắc.';
  const rating = (4.7 + ((product.id * 7) % 4) * 0.1).toFixed(1);
  const reviews = 20 + ((product.id * 17) % 75);

  modalContent.innerHTML = `
    <div class="modal-body">
      <div class="modal-img-wrap">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='images/products/HLC_New_logo_5.1_Products__PHIN_DEN_DA.jpg'">
      </div>
      <div class="modal-content-wrap">
        <span class="badge badge-caramel modal-cat-tag">${category.name}</span>
        
        <div class="product-rating" style="margin-bottom: 12px;">
          <div class="stars" style="color: #F59E0B; display: flex; gap: 3px;">
            <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
          </div>
          <span class="rating-val" style="font-weight: 800; margin-left: 6px;">${rating}</span>
          <span class="rating-count" style="color: var(--text-light); font-size: 0.82rem;">(${reviews} lượt đánh giá)</span>
        </div>

        <h3>${product.name}</h3>
        <div class="modal-price">${formatVND(product.price)}</div>
        <div class="modal-desc">${cleanDescription}</div>
        
        <div style="margin-bottom: 24px;">
          <label style="display: block; font-size: 0.85rem; font-weight: 800; color: var(--text-main); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Kích cỡ ly (Size):</label>
          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn btn-sm btn-secondary" style="background: var(--dark-gradient); color: white; border-color: var(--accent);">Vừa (M) - Chuẩn</button>
            <button type="button" class="btn btn-sm btn-secondary" style="background: var(--bg-surface-secondary); color: var(--text-main);">Lớn (L) +10.000đ</button>
          </div>
        </div>

        <div class="modal-actions">
          <div class="qty-control">
            <button class="qty-btn" id="modalQtyMinus">-</button>
            <input type="number" id="modalQtyInput" class="qty-input" value="1" min="1" max="99">
            <button class="qty-btn" id="modalQtyPlus">+</button>
          </div>
          <button class="btn btn-primary" id="modalAddToCartBtn" style="padding: 14px 34px;">
            <i class="fas fa-shopping-bag"></i> Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  `;

  // Bind modal quantity handlers
  const qtyInput = document.getElementById('modalQtyInput');
  const qtyMinus = document.getElementById('modalQtyMinus');
  const qtyPlus = document.getElementById('modalQtyPlus');
  const addBtn = document.getElementById('modalAddToCartBtn');

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val > 1) qtyInput.value = val - 1;
    });
    qtyPlus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      qtyInput.value = val + 1;
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const qty = parseInt(qtyInput.value) || 1;
      addToCart(product.id, qty);
      closeQuickView();
    });
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const modal = document.getElementById('quickViewModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   Product Card HTML Template (Upgraded Menu Card)
   ========================================================================== */

function createProductCardHTML(product) {
  const category = getCategoryById(product.category_id);
  const cleanExcerpt = stripHtml(product.description) || 'Hương vị hảo hạng được tinh tuyển từ những nguyên liệu chất lượng hàng đầu.';
  const rating = (4.7 + ((product.id * 7) % 4) * 0.1).toFixed(1);
  const reviews = 20 + ((product.id * 17) % 75);
  
  const isHot = product.id % 5 === 1 || product.id === 1 || product.id === 7 || product.id === 24 || product.id === 29;
  const isNew = product.id % 7 === 0 || product.id === 10 || product.id === 22 || product.id === 36;

  let badgeHTML = '';
  if (isHot) {
    badgeHTML = `<span class="product-flag badge-hot"><i class="fas fa-fire"></i> Hot</span>`;
  } else if (isNew) {
    badgeHTML = `<span class="product-flag badge-new"><i class="fas fa-sparkles"></i> Mới</span>`;
  }

  return `
    <div class="product-card" data-category="${product.category_id}">
      <div class="product-thumb">
        <span class="product-cat-tag">${category.name}</span>
        ${badgeHTML}
        <button class="product-quick-btn" onclick="openQuickView(${product.id})" title="Xem chi tiết nhanh">
          <i class="fas fa-eye"></i>
        </button>
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='images/products/HLC_New_logo_5.1_Products__PHIN_DEN_DA.jpg'">
      </div>
      <div class="product-info">
        <div class="product-rating">
          <div class="stars">
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star${rating >= 4.9 ? '' : '-half-alt'}"></i>
          </div>
          <span class="rating-val">${rating}</span>
          <span class="rating-count">(${reviews})</span>
        </div>
        <h3 class="product-title" onclick="openQuickView(${product.id})" style="cursor: pointer;">${product.name}</h3>
        <p class="product-excerpt">${cleanExcerpt}</p>
        <div class="product-meta">
          <div class="price-wrap">
            <span class="price-label">Giá niêm yết</span>
            <span class="product-price">${formatVND(product.price)}</span>
          </div>
          <button class="btn-add-cart" onclick="addToCart(${product.id})" title="Thêm vào giỏ">
            <i class="fas fa-shopping-bag"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   Home Page: Carousel Slider
   ========================================================================== */

function initCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  const container = document.querySelector('.carousel-container');

  if (!slides.length) return;

  function goToSlide(index) {
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
    AppState.currentSlide = index;
  }

  function nextSlide() {
    let nextIndex = (AppState.currentSlide + 1) % slides.length;
    goToSlide(nextIndex);
  }

  function prevSlide() {
    let prevIndex = (AppState.currentSlide - 1 + slides.length) % slides.length;
    goToSlide(prevIndex);
  }

  function startAutoPlay() {
    stopAutoPlay();
    AppState.carouselTimer = setInterval(nextSlide, 5000);
  }

  function stopAutoPlay() {
    if (AppState.carouselTimer) {
      clearInterval(AppState.carouselTimer);
      AppState.carouselTimer = null;
    }
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoPlay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoPlay(); });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      startAutoPlay();
    });
  });

  if (container) {
    container.addEventListener('mouseenter', stopAutoPlay);
    container.addEventListener('mouseleave', startAutoPlay);

    // Touch swipe support
    let touchStartX = 0;
    container.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', e => {
      let touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        nextSlide();
        startAutoPlay();
      } else if (touchEndX - touchStartX > 50) {
        prevSlide();
        startAutoPlay();
      }
    }, { passive: true });
  }

  startAutoPlay();
}

/* ==========================================================================
   Home Page: Latest Products & Category Cards
   ========================================================================== */

function renderHomePage() {
  // 1. Render Latest Products (Top 8 items by ID / latest added)
  const latestContainer = document.getElementById('latestProductsGrid');
  if (latestContainer) {
    const latestProducts = [...AppState.products]
      .sort((a, b) => b.id - a.id)
      .slice(0, 8);

    latestContainer.innerHTML = latestProducts.map(createProductCardHTML).join('');
  }

  // 2. Render Featured Category Cards
  const catContainer = document.getElementById('featuredCategoryGrid');
  if (catContainer) {
    const categoryIcons = {
      1: 'fa-mug-hot',
      2: 'fa-blender',
      3: 'fa-leaf',
      4: 'fa-cookie-bite'
    };

    let catHTML = '';
    AppState.categories.forEach(cat => {
      const count = AppState.products.filter(p => p.category_id === cat.id).length;
      const icon = categoryIcons[cat.id] || 'fa-coffee';
      catHTML += `
        <div class="category-card" onclick="window.location.href='products.html?category=${cat.id}'">
          <div class="category-icon-box">
            <i class="fas ${icon}"></i>
          </div>
          <h3>${cat.name}</h3>
          <p>${cat.description || 'Thưởng thức hương vị tươi ngon độc đáo được pha chế chuẩn vị tại CoffeeShop.'}</p>
          <span class="category-count">${count} món ngon <i class="fas fa-arrow-right" style="font-size: 0.75rem;"></i></span>
        </div>
      `;
    });
    catContainer.innerHTML = catHTML;
  }
}

/* ==========================================================================
   Products Page: Filtering, Searching & Sorting
   ========================================================================== */

function initProductsPage() {
  const gridContainer = document.getElementById('productsPageGrid');
  const tabsContainer = document.getElementById('categoryTabsContainer');
  const searchInput = document.getElementById('productSearchInput');
  const sortSelect = document.getElementById('productSortSelect');

  if (!gridContainer) return;

  // Check URL query parameters for ?category=id or ?search=kw
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('category')) {
    const catParam = parseInt(urlParams.get('category'));
    if (!isNaN(catParam)) {
      AppState.selectedCategory = catParam;
    }
  }
  if (urlParams.has('search')) {
    AppState.searchQuery = urlParams.get('search');
    if (searchInput) searchInput.value = AppState.searchQuery;
  }

  // 1. Render Category Filter Tabs
  if (tabsContainer) {
    const totalAll = AppState.products.length;
    const catIcons = {
      0: 'fa-th-large',
      1: 'fa-mug-hot',
      2: 'fa-blender',
      3: 'fa-leaf',
      4: 'fa-cookie-bite'
    };

    let tabsHTML = `
      <button class="cat-tab-btn ${AppState.selectedCategory === 0 ? 'active' : ''}" data-cat="0">
        <i class="fas ${catIcons[0]}"></i> Tất cả <span class="badge-pill">${totalAll}</span>
      </button>
    `;

    AppState.categories.forEach(cat => {
      const count = AppState.products.filter(p => p.category_id === cat.id).length;
      const isActive = AppState.selectedCategory === cat.id;
      const icon = catIcons[cat.id] || 'fa-coffee';
      tabsHTML += `
        <button class="cat-tab-btn ${isActive ? 'active' : ''}" data-cat="${cat.id}">
          <i class="fas ${icon}"></i> ${cat.name} <span class="badge-pill">${count}</span>
        </button>
      `;
    });

    tabsContainer.innerHTML = tabsHTML;

    // Attach click events
    tabsContainer.querySelectorAll('.cat-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        tabsContainer.querySelectorAll('.cat-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        AppState.selectedCategory = parseInt(btn.getAttribute('data-cat'));
        applyProductFilters();
      });
    });
  }

  // 2. Attach Search Event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.searchQuery = e.target.value.trim().toLowerCase();
      applyProductFilters();
    });
  }

  // 3. Attach Sort Event
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      AppState.sortBy = e.target.value;
      applyProductFilters();
    });
  }

  // Initial filter & render
  applyProductFilters();
}

function applyProductFilters() {
  const gridContainer = document.getElementById('productsPageGrid');
  const statusBar = document.getElementById('productStatusBar');
  if (!gridContainer) return;

  let filtered = [...AppState.products];

  // Category filter
  if (AppState.selectedCategory > 0) {
    filtered = filtered.filter(p => p.category_id === AppState.selectedCategory);
  }

  // Search filter
  if (AppState.searchQuery) {
    filtered = filtered.filter(p => {
      const name = p.name.toLowerCase();
      const desc = stripHtml(p.description).toLowerCase();
      return name.includes(AppState.searchQuery) || desc.includes(AppState.searchQuery);
    });
  }

  // Sort
  if (AppState.sortBy === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (AppState.sortBy === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (AppState.sortBy === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (AppState.sortBy === 'name-desc') {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  }

  // Status text
  if (statusBar) {
    const categoryName = AppState.selectedCategory > 0 ? getCategoryById(AppState.selectedCategory).name : 'Tất cả';
    statusBar.innerHTML = `
      <span>Hiển thị <strong>${filtered.length}</strong> món ngon thuộc danh mục: <strong>${categoryName}</strong></span>
      <span style="font-size: 0.85rem; color: var(--text-light);"><i class="fas fa-check-circle" style="color: var(--accent);"></i> Đang phục vụ</span>
    `;
  }

  // Render Grid or Empty state
  if (filtered.length === 0) {
    gridContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-mug-hot"></i>
        <h3>Không tìm thấy món nào phù hợp!</h3>
        <p>Vui lòng thử tìm kiếm với từ khóa khác hoặc bấm nút đặt lại bộ lọc.</p>
        <button class="btn btn-secondary" onclick="resetFilters()">
          <i class="fas fa-redo"></i> Đặt lại bộ lọc
        </button>
      </div>
    `;
  } else {
    gridContainer.innerHTML = filtered.map(createProductCardHTML).join('');
  }
}

function resetFilters() {
  AppState.selectedCategory = 0;
  AppState.searchQuery = '';
  AppState.sortBy = 'default';

  const searchInput = document.getElementById('productSearchInput');
  const sortSelect = document.getElementById('productSortSelect');
  const tabsContainer = document.getElementById('categoryTabsContainer');

  if (searchInput) searchInput.value = '';
  if (sortSelect) sortSelect.value = 'default';
  if (tabsContainer) {
    tabsContainer.querySelectorAll('.cat-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-cat') === '0');
    });
  }

  applyProductFilters();
}

/* ==========================================================================
   Contact Page: Feedback Form, Rating & FAQ
   ========================================================================== */

function initContactPage() {
  const form = document.getElementById('feedbackForm');
  const starBtns = document.querySelectorAll('.star-btn');
  const ratingText = document.getElementById('ratingText');
  const ratingInput = document.getElementById('ratingValueInput');

  let selectedRating = 5;
  const ratingLabels = {
    1: '1/5 - Chưa hài lòng',
    2: '2/5 - Tạm được',
    3: '3/5 - Bình thường',
    4: '4/5 - Rất hài lòng',
    5: '5/5 - Cực kỳ tuyệt vời!'
  };

  function updateStars(rating) {
    starBtns.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-value'));
      btn.classList.toggle('active', val <= rating);
    });
    if (ratingText) ratingText.textContent = ratingLabels[rating] || '';
    if (ratingInput) ratingInput.value = rating;
  }

  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.getAttribute('data-value'));
      updateStars(selectedRating);
    });

    btn.addEventListener('mouseenter', () => {
      const hoverVal = parseInt(btn.getAttribute('data-value'));
      starBtns.forEach(b => {
        const val = parseInt(b.getAttribute('data-value'));
        b.classList.toggle('hover', val <= hoverVal);
      });
    });

    btn.addEventListener('mouseleave', () => {
      starBtns.forEach(b => b.classList.remove('hover'));
    });
  });

  updateStars(5);

  // Form submission handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('feedbackName').value.trim();
      const phone = document.getElementById('feedbackPhone').value.trim();
      const email = document.getElementById('feedbackEmail') ? document.getElementById('feedbackEmail').value.trim() : '';
      const subject = document.getElementById('feedbackSubject') ? document.getElementById('feedbackSubject').value.trim() : 'Góp ý chung';
      const message = document.getElementById('feedbackMessage').value.trim();
      const submitBtn = document.getElementById('feedbackSubmitBtn');

      if (!name || !phone || !message) {
        showToast('Lỗi', 'Vui lòng điền đầy đủ các thông tin bắt buộc (*)', 'danger');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi phản hồi...';
      }

      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            phone,
            email,
            subject,
            rating: selectedRating,
            message
          })
        });

        if (response.ok) {
          const resData = await response.json();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi Phản Hồi';
          }
          form.reset();
          updateStars(5);
          showToast('Cảm ơn bạn!', resData.message || `CoffeeShop đã lưu phản hồi từ bạn (${name}) vào CSDL!`, 'success');
          return;
        }
      } catch (err) {
        // Fallback simulation
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi Phản Hồi';
        }
        form.reset();
        updateStars(5);
        showToast('Cảm ơn bạn!', `CoffeeShop đã nhận được phản hồi từ bạn (${name}). Ý kiến của bạn giúp chúng tôi hoàn thiện hơn mỗi ngày!`, 'success');
      }, 800);
    });
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(f => f.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });
}

/* ==========================================================================
   Global Common Interactions (Header, Mobile Menu, Modals, Back-to-Top)
   ========================================================================== */

function initGlobalInteractions() {
  // Mobile Nav Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });
  }

  // Header scroll shadow
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 30);
    }

    // Back to Top button toggle
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
      if (window.scrollY > 350) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    }
  });

  // Back to Top click
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Cart Drawer open/close buttons
  const cartBtn = document.getElementById('cartOpenBtn');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartBackdrop = document.getElementById('cartDrawerBackdrop');
  const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');

  if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCartDrawer);

  // User Auth & Account Dropdown Listeners
  const userAuthBtn = document.getElementById('userAuthBtn');
  const userMenuDropdown = document.getElementById('userMenuDropdown');
  if (userAuthBtn) {
    userAuthBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (AppState.currentUser) {
        if (userMenuDropdown) userMenuDropdown.classList.toggle('active');
      } else {
        openAuthModal('login');
      }
    });
  }

  document.addEventListener('click', (e) => {
    if (userMenuDropdown && !userMenuDropdown.contains(e.target) && e.target !== userAuthBtn) {
      userMenuDropdown.classList.remove('active');
    }
  });

  const menuLogoutBtn = document.getElementById('menuLogoutBtn');
  if (menuLogoutBtn) menuLogoutBtn.addEventListener('click', handleLogout);

  const menuMyOrdersBtn = document.getElementById('menuMyOrdersBtn');
  if (menuMyOrdersBtn) menuMyOrdersBtn.addEventListener('click', openMyOrdersModal);

  const authCloseBtn = document.getElementById('authModalCloseBtn');
  if (authCloseBtn) authCloseBtn.addEventListener('click', closeAuthModal);

  const checkoutCloseBtn = document.getElementById('checkoutCloseBtn');
  if (checkoutCloseBtn) checkoutCloseBtn.addEventListener('click', closeCheckoutModal);

  const myOrdersCloseBtn = document.getElementById('myOrdersCloseBtn');
  if (myOrdersCloseBtn) myOrdersCloseBtn.addEventListener('click', closeMyOrdersModal);

  // Cart Checkout Action
  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener('click', () => {
      if (AppState.cart.length === 0) {
        showToast('Thông báo', 'Giỏ hàng của bạn đang trống! Vui lòng chọn món trước khi đặt.', 'info');
        return;
      }
      closeCartDrawer();
      openCheckoutModal();
    });
  }

  // Quick view modal backdrop close & escape key
  const modal = document.getElementById('quickViewModal');
  const modalClose = document.getElementById('modalCloseBtn');
  if (modalClose) modalClose.addEventListener('click', closeQuickView);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeQuickView();
    });
  }

  // Auth modal backdrop click close
  const authModal = document.getElementById('authModal');
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  // Checkout modal backdrop click close
  const checkoutModal = document.getElementById('checkoutModal');
  if (checkoutModal) {
    checkoutModal.addEventListener('click', (e) => {
      if (e.target === checkoutModal) closeCheckoutModal();
    });
  }

  // My Orders modal backdrop click close
  const myOrdersModal = document.getElementById('myOrdersModal');
  if (myOrdersModal) {
    myOrdersModal.addEventListener('click', (e) => {
      if (e.target === myOrdersModal) closeMyOrdersModal();
    });
  }

  // Order Success modal backdrop click close
  const orderSuccessModal = document.getElementById('orderSuccessModal');
  if (orderSuccessModal) {
    orderSuccessModal.addEventListener('click', (e) => {
      if (e.target === orderSuccessModal) closeOrderSuccessModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeQuickView();
      closeCartDrawer();
      closeAuthModal();
      closeCheckoutModal();
      closeMyOrdersModal();
      closeOrderSuccessModal();
    }
  });
}

/* ==========================================================================
   User Authentication Logic (Register, Login, Session)
   ========================================================================== */

async function checkAuthStatus() {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      if (data.logged_in && data.customer) {
        AppState.currentUser = data.customer;
      } else {
        AppState.currentUser = null;
      }
      updateUserHeaderUI();
    }
  } catch (err) {
    console.warn('Cannot check auth status:', err);
  }
}

function updateUserHeaderUI() {
  const container = document.getElementById('userAccountContainer');
  const displayName = document.getElementById('userDisplayName');
  const displayEmail = document.getElementById('userDisplayEmail');
  const authBtn = document.getElementById('userAuthBtn');

  if (!container) return;

  if (AppState.currentUser) {
    container.classList.add('logged-in');
    if (displayName) displayName.textContent = AppState.currentUser.fullname || 'Khách hàng';
    if (displayEmail) displayEmail.textContent = AppState.currentUser.email || '';
    if (authBtn) authBtn.title = `Chào, ${AppState.currentUser.fullname}`;
  } else {
    container.classList.remove('logged-in');
    if (displayName) displayName.textContent = 'Khách hàng';
    if (displayEmail) displayEmail.textContent = 'Chưa đăng nhập';
    if (authBtn) authBtn.title = 'Tài khoản / Đăng nhập';
  }
}

function openAuthModal(tab = 'login') {
  const modal = document.getElementById('authModal');
  const alertBox = document.getElementById('authAlert');
  if (alertBox) {
    alertBox.className = 'auth-alert';
    alertBox.style.display = 'none';
    alertBox.textContent = '';
  }
  switchAuthTab(tab);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function switchAuthTab(tab) {
  const loginBtn = document.getElementById('tabLoginBtn');
  const regBtn = document.getElementById('tabRegisterBtn');
  const loginPane = document.getElementById('loginForm');
  const regPane = document.getElementById('registerForm');
  const alertBox = document.getElementById('authAlert');
  if (alertBox) alertBox.style.display = 'none';

  if (tab === 'login') {
    if (loginBtn) loginBtn.classList.add('active');
    if (regBtn) regBtn.classList.remove('active');
    if (loginPane) loginPane.classList.add('active');
    if (regPane) regPane.classList.remove('active');
  } else {
    if (regBtn) regBtn.classList.add('active');
    if (loginBtn) loginBtn.classList.remove('active');
    if (regPane) regPane.classList.add('active');
    if (loginPane) loginPane.classList.remove('active');
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const alertBox = document.getElementById('authAlert');
  const submitBtn = document.getElementById('loginSubmitBtn');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xác thực...';
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok && data.success) {
      AppState.currentUser = data.customer;
      updateUserHeaderUI();
      closeAuthModal();
      showToast('Thành công', data.message || `Chào mừng bạn trở lại, ${data.customer.fullname}!`, 'success');
      document.getElementById('loginForm').reset();
    } else {
      if (alertBox) {
        alertBox.className = 'auth-alert error';
        alertBox.textContent = data.message || 'Email hoặc mật khẩu không chính xác!';
        alertBox.style.display = 'block';
      }
    }
  } catch (err) {
    if (alertBox) {
      alertBox.className = 'auth-alert error';
      alertBox.textContent = 'Lỗi kết nối máy chủ. Vui lòng thử lại sau!';
      alertBox.style.display = 'block';
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Đăng Nhập Ngay';
    }
  }
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  const fullname = document.getElementById('regFullname').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const address = document.getElementById('regAddress').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const alertBox = document.getElementById('authAlert');
  const submitBtn = document.getElementById('regSubmitBtn');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo tài khoản...';
  }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname, email, phone, address, password })
    });
    const data = await res.json();

    if (res.ok && data.success) {
      AppState.currentUser = data.customer;
      updateUserHeaderUI();
      closeAuthModal();
      showToast('Đăng ký thành công', data.message || 'Tài khoản của bạn đã sẵn sàng sử dụng!', 'success');
      document.getElementById('registerForm').reset();
    } else {
      if (alertBox) {
        alertBox.className = 'auth-alert error';
        alertBox.textContent = data.message || 'Không thể đăng ký. Vui lòng kiểm tra lại thông tin!';
        alertBox.style.display = 'block';
      }
    }
  } catch (err) {
    if (alertBox) {
      alertBox.className = 'auth-alert error';
      alertBox.textContent = 'Lỗi kết nối máy chủ. Vui lòng thử lại sau!';
      alertBox.style.display = 'block';
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-user-check"></i> Đăng Ký Tài Khoản';
    }
  }
}

async function handleLogout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (e) {
    console.warn('Logout error:', e);
  }
  AppState.currentUser = null;
  updateUserHeaderUI();
  const dropdown = document.getElementById('userMenuDropdown');
  if (dropdown) dropdown.classList.remove('active');
  showToast('Đã đăng xuất', 'Hẹn gặp lại bạn lần sau!', 'info');
}

/* ==========================================================================
   Checkout & Orders Logic
   ========================================================================== */

function openCheckoutModal() {
  if (AppState.cart.length === 0) {
    showToast('Thông báo', 'Giỏ hàng đang trống! Vui lòng chọn món trước khi đặt.', 'info');
    return;
  }

  const modal = document.getElementById('checkoutModal');
  const itemsContainer = document.getElementById('checkoutItemsList');
  const totalBox = document.getElementById('checkoutTotalAmount');

  // Điền trước thông tin người nhận nếu đã đăng nhập
  const nameInput = document.getElementById('chkFullname');
  const phoneInput = document.getElementById('chkPhone');
  const addrInput = document.getElementById('chkAddress');

  if (AppState.currentUser) {
    if (nameInput) nameInput.value = AppState.currentUser.fullname || '';
    if (phoneInput) phoneInput.value = AppState.currentUser.phone || '';
    if (addrInput) addrInput.value = AppState.currentUser.address || '';
  }

  // Render danh sách món trong checkout summary
  if (itemsContainer) {
    itemsContainer.innerHTML = AppState.cart.map(item => `
      <div class="checkout-item">
        <div>
          <span class="checkout-item-name">${escapeHtml(item.name)}</span>
          <span class="checkout-item-qty">x${item.quantity}</span>
        </div>
        <span class="checkout-item-price">${formatCurrency(item.price * item.quantity)}</span>
      </div>
    `).join('');
  }

  const total = AppState.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  if (totalBox) totalBox.textContent = formatCurrency(total);

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

async function handleCheckoutSubmit(event) {
  event.preventDefault();
  if (AppState.cart.length === 0) {
    showToast('Lỗi', 'Giỏ hàng của bạn đang trống!', 'error');
    return;
  }

  const fullname = document.getElementById('chkFullname').value.trim();
  const phone = document.getElementById('chkPhone').value.trim();
  const address = document.getElementById('chkAddress').value.trim();
  const note = document.getElementById('chkNote') ? document.getElementById('chkNote').value.trim() : '';
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cod';
  const submitBtn = document.getElementById('btnPlaceOrder');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý đơn hàng...';
  }

  const payload = {
    fullname,
    phone,
    address,
    note,
    payment_method: paymentMethod,
    email: AppState.currentUser ? AppState.currentUser.email : '',
    items: AppState.cart.map(i => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity
    }))
  };

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (res.ok && data.success) {
      // Xóa giỏ hàng
      clearCart();
      closeCheckoutModal();

      // Hiển thị modal đặt hàng thành công
      showOrderSuccessModal({
        order_id: data.order_id,
        total_amount: data.total_amount,
        fullname,
        phone,
        address,
        payment_method: paymentMethod
      });

      showToast('Đặt hàng thành công!', `Đơn hàng #${data.order_id} của bạn đã được ghi nhận vào hệ thống.`, 'success');
      document.getElementById('checkoutForm').reset();
    } else {
      showToast('Không thể đặt hàng', data.message || 'Đã có lỗi xảy ra khi tạo đơn hàng.', 'error');
    }
  } catch (err) {
    showToast('Lỗi kết nối', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại!', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Đặt Hàng Ngay';
    }
  }
}

function showOrderSuccessModal(info) {
  const modal = document.getElementById('orderSuccessModal');
  const badge = document.getElementById('successOrderBadge');
  const details = document.getElementById('successOrderDetails');

  if (badge) badge.textContent = `Mã đơn hàng: #DH${info.order_id}`;
  if (details) {
    const payMethodText = info.payment_method === 'bank_transfer' ? 'Chuyển khoản QR Ngân Hàng' : 'Tiền mặt khi nhận hàng (COD)';
    details.innerHTML = `
      <div style="margin-bottom: 6px;"><strong>Người nhận:</strong> ${escapeHtml(info.fullname)} (${escapeHtml(info.phone)})</div>
      <div style="margin-bottom: 6px;"><strong>Địa chỉ:</strong> ${escapeHtml(info.address)}</div>
      <div style="margin-bottom: 6px;"><strong>Hình thức:</strong> ${payMethodText}</div>
      <div style="margin-bottom: 6px;"><strong>Tổng thanh toán:</strong> <strong style="color: var(--accent-hover);">${formatCurrency(info.total_amount)}</strong></div>
      <div style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 10px; border-top: 1px dashed var(--border-subtle); padding-top: 8px;">
        <i class="fas fa-clock"></i> Thời gian giao dự kiến: <strong>25 - 35 phút</strong>
      </div>
    `;
  }

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeOrderSuccessModal() {
  const modal = document.getElementById('orderSuccessModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

async function openMyOrdersModal() {
  const dropdown = document.getElementById('userMenuDropdown');
  if (dropdown) dropdown.classList.remove('active');

  if (!AppState.currentUser) {
    openAuthModal('login');
    showToast('Thông báo', 'Vui lòng đăng nhập để xem lịch sử đơn hàng của bạn!', 'info');
    return;
  }

  const modal = document.getElementById('myOrdersModal');
  const listBody = document.getElementById('myOrdersListBody');
  if (listBody) {
    listBody.innerHTML = '<div style="text-align:center; padding: 30px;"><i class="fas fa-spinner fa-spin fa-2x" style="color: var(--accent);"></i><p style="margin-top: 10px;">Đang tải danh sách đơn hàng...</p></div>';
  }

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  try {
    const res = await fetch('/api/my-orders');
    const data = await res.json();

    if (res.ok && data.success && data.orders && data.orders.length > 0) {
      listBody.innerHTML = data.orders.map(order => {
        let statusBadge = '';
        if (order.status === 'paid') statusBadge = '<span class="status-badge status-paid">Đã thanh toán</span>';
        else if (order.status === 'shipped') statusBadge = '<span class="status-badge status-shipped">Đang giao</span>';
        else if (order.status === 'completed') statusBadge = '<span class="status-badge status-completed">Hoàn tất</span>';
        else if (order.status === 'cancelled') statusBadge = '<span class="status-badge status-cancelled">Đã hủy</span>';
        else statusBadge = '<span class="status-badge status-pending">Chờ xác nhận</span>';

        const itemsHtml = (order.items || []).map(it => `
          <div style="display: flex; justify-content: space-between; font-size: 0.88rem; padding: 4px 0;">
            <span>${escapeHtml(it.product_name)} x${it.quantity}</span>
            <strong>${formatCurrency(it.subtotal)}</strong>
          </div>
        `).join('');

        return `
          <div class="order-history-card">
            <div class="order-history-header">
              <div>
                <strong>Đơn hàng #DH${order.id}</strong>
                <div style="font-size: 0.8rem; color: var(--text-light); margin-top: 2px;">
                  <i class="far fa-calendar-alt"></i> ${order.order_date || ''}
                </div>
              </div>
              ${statusBadge}
            </div>
            <div style="margin-bottom: 12px; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 8px;">
              ${itemsHtml}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.95rem;">
              <span style="color: var(--text-secondary);">Giao đến: ${escapeHtml(order.shipping_address || order.address || 'Tại quán')}</span>
              <div>Tổng tiền: <strong style="color: var(--accent-hover); font-size: 1.1rem;">${formatCurrency(order.total_amount)}</strong></div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      listBody.innerHTML = `
        <div style="text-align: center; padding: 48px 20px;">
          <i class="fas fa-shopping-bag fa-3x" style="color: var(--text-light); opacity: 0.4; margin-bottom: 16px;"></i>
          <h4 style="margin-bottom: 8px;">Bạn chưa có đơn hàng nào</h4>
          <p style="color: var(--text-secondary); margin-bottom: 20px;">Hãy thưởng thức những tách cà phê thơm ngon từ CoffeeShop nhé!</p>
          <a href="products.html" class="btn btn-primary" onclick="closeMyOrdersModal();"><i class="fas fa-mug-hot"></i> Khám Phá Menu</a>
        </div>
      `;
    }
  } catch (err) {
    if (listBody) {
      listBody.innerHTML = '<p style="color: #EF4444; text-align: center; padding: 20px;">Không thể tải dữ liệu đơn hàng. Vui lòng thử lại sau!</p>';
    }
  }
}

function closeMyOrdersModal() {
  const modal = document.getElementById('myOrdersModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   Application Initialization
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Global Cart
  initCart();

  // 2. Initialize Navigation & Global UI Listeners
  initGlobalInteractions();

  // 3. Check User Authentication Status
  await checkAuthStatus();

  // 4. Load Data from CSV
  await loadAppData();

  // 5. Page specific initializations
  if (document.querySelector('.carousel-container')) {
    initCarousel();
  }

  if (document.getElementById('latestProductsGrid') || document.getElementById('featuredCategoryGrid')) {
    renderHomePage();
  }

  if (document.getElementById('productsPageGrid')) {
    initProductsPage();
  }

  if (document.getElementById('feedbackForm') || document.querySelector('.faq-item')) {
    initContactPage();
  }
});
