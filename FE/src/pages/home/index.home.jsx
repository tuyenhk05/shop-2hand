import { useEffect, useState } from "react";
import AnimateWhenVisible from "../../helpers/animationScroll";
import productImagesModel from "../../assets/images/product_ex.png";
import imgNam from "../../assets/images/thoi_trang_nam.avif";
import imgNu from "../../assets/images/thoi_trang_nu.avif";
import imgGiay from "../../assets/images/giay_dep.avif";
import imgPhuKien from "../../assets/images/phu_kien_va_trang_suc.avif";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../../services/products";
import { getAllCategories } from "../../services/category.service";
import Loading from "../../components/loading/loading";
import useScrollToTop from "../../hooks/useScrollToTop";
import { useSelector } from "react-redux";

export default function Home() {
    useScrollToTop();
    const isLogin = useSelector((state) => state.auth.isLogin);
    console.log(isLogin);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const formatPrice = (price) => {
        if (!price) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const defaultCategoryImages = [imgNam, imgNu, imgPhuKien, imgGiay];

    useEffect(() => {
        const dataFetch = async () => {
            setLoading(true);
            try {
                const [productRes, categoryRes] = await Promise.all([
                    getAllProducts(),
                    getAllCategories()
                ]);

                if (productRes.success) {
                    setProducts(productRes.data);
                }
                if (categoryRes.success) {
                    setCategories(categoryRes.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch home data:', error);
            } finally {
                setLoading(false);
            }
        };
        dataFetch();
    }, []);

    if (loading) {
        return <Loading fullScreen={true} text="Atelier loading..." />;
    }
    console.log('Products state after fetch:', products); // Debug log to check state update


    return (
        <div className="bg-background text-on-background font-manrope">
            <div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `
                    radial-gradient(circle at 20% 80%, rgba(255, 160, 146, 0.15) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 244, 228, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 50% 30%, rgba(255, 160, 146, 0.1) 0%, transparent 50%)`,
                }}
            />
            <main className="pt-8 pb-20">
                {/* HERO */}
                <section className="px-6 md:px-12 mb-28 max-w-[1400px] mx-auto flex flex-col md:flex-row items-center gap-12" style={{ maxHeight: "90vh" }}>
                    {/* Text Content */}
                    <AnimateWhenVisible direction="slideFromLeft" className="w-full md:w-1/2 flex flex-col space-y-6">
                        <div className="inline-flex items-center px-4 py-1.5 bg-orange-600/10 border border-orange-600/20 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest w-fit mb-2 hover:bg-orange-600/20 transition-colors"
                            style={{ color: "#4A5D4E", backgroundColor: "#E4E5DE", borderColor: "transparent" }}
                        >
                            Nguồn gốc được tuyển chọn
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-slate-900 leading-tight tracking-tight">
                            Di sản được <br />
                            <i className="font-semibold italic text-orange-800">tái tạo.</i>
                        </h1>

                        <p className="text-slate-600 text-lg md:text-xl max-w-md leading-relaxed font-medium">
                            Khám phá những món đồ thời trang second-hand được tái định nghĩa như những tác phẩm nghệ thuật cao cấp.
                        </p>

                        <div className="pt-4">
                            <button className="px-8 py-4 bg-orange-600 text-white rounded-xl font-bold tracking-widest text-sm uppercase hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20"
                                style={{ backgroundColor: "#4A5D4E", color: "#E4E5DE" }}
                                onClick={() => navigate('/products')}
                            >
                                Đến Cửa Hàng
                            </button>
                        </div>
                    </AnimateWhenVisible>

                    {/* Image Visual */}
                    <AnimateWhenVisible
                        direction="slideFromRight"
                        className="w-full md:w-1/2 relative flex items-center"
                    >
                        <div 
                            className="w-full max-h-[70vh] md:max-h-[80vh] aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-900/10 relative group bg-slate-100 border border-outline-variant/10 cursor-pointer"
                            onClick={() => products[0] && navigate(`/products/${products[0].slug}`)}
                        >
                            <img
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[2s] ease-out"
                                alt="featured product"
                                src={products[0]?.images?.find(img => img.isPrimary)?.imageUrl || products[0]?.images?.[0]?.imageUrl || productImagesModel}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-1000"></div>
                            <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 transform translate-y-4 group-hover:translate-y-0 opacity-90 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-[1s] ease-out"></div>
                                <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-primary mb-2 block">Archive Nổi Bật</span>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h3 className="font-serif text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors duration-300">{products[0]?.title || 'Sản phẩm tiêu biểu'}</h3>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-4">
                                        <span className="text-sm font-bold text-slate-600 bg-surface-container-high px-3 py-1 rounded-full">{formatPrice(products[0]?.price)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AnimateWhenVisible>
                </section>

                {/* NEW ARRIVALS */}
                <section className="px-6 max-w-7xl mx-auto mb-24">
                    <AnimateWhenVisible className="flex justify-between items-center mb-16">
                        <h2 className="text-4xl font-notoSerif font-bold text-on-background relative inline-block">
                            Sản phẩm mới
                            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-primary rounded-full"></span>
                        </h2>
                        <button
                            onClick={() => navigate('/products')}
                            className="text-primary font-bold text-sm border-b border-primary/30 pb-1 hover:border-primary hover:text-primary-fixed-variant transition-all flex items-center gap-1 group"
                        >
                            Xem tất cả Kho <span className="material-symbols-outlined text-sm transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                    </AnimateWhenVisible>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-16 gap-x-8">
                        {products.slice(0, 5).map((item, index) => {
                            const aspectRatios = [
                                'aspect-[3/4]',    // 0
                                'aspect-[3/5]',    // 1 (Tall center)
                                'aspect-[3/4]',    // 2
                                'aspect-[3/4]',    // 3
                                'aspect-[3/4]',    // 4
                            ];
                            const containerClasses = [
                                '',                                 // 0
                                'md:row-span-2 pt-12',              // 1 (The tall focus item)
                                '',                                 // 2
                                'md:mt-[-4rem]',                   // 3 (Offset for asymmetric look)
                                '',                                 // 4
                            ][index] || '';

                            return (
                                <AnimateWhenVisible
                                    key={item.id || index}
                                    direction="fadeInUp"
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className={`group cursor-pointer ${containerClasses} relative transition-all duration-500 hover:-translate-y-3`}
                                    onClick={() => navigate(`/products/${item.slug}`)}
                                >
                                    <div className={`${aspectRatios[index] || 'aspect-[3/4]'} rounded-xl overflow-hidden bg-surface-container-high mb-5 relative shadow-sm group-hover:shadow-2xl transition-all duration-500`}>
                                        <img
                                            src={item.images?.find(img => img.isPrimary)?.imageUrl || item.images?.[0]?.imageUrl || 'LINK_ẢNH_MẶC_ĐỊNH_KHI_TRỐNG'}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                                            alt={item.title}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center">
                                            <span className="bg-white/95 text-primary font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-xl">
                                                Xem ngay
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <span className="inline-block px-2 py-0.5 bg-tertiary-container/50 text-on-tertiary-container text-[9px] font-bold rounded mb-3 uppercase tracking-wider border border-tertiary-container">
                                        Verified
                                    </span>
                                    
                                    <h4 className="font-manrope font-semibold text-lg text-on-background line-clamp-1 group-hover:text-primary transition-colors duration-300">
                                        {item.title}
                                    </h4>
                                    
                                    <p className="text-on-surface-variant text-sm mb-2 line-clamp-1">
                                        {item.color} • {item.material}
                                    </p>
                                    
                                    <span className="text-primary font-bold text-lg">
                                        {formatPrice(item.price)}
                                    </span>
                                </AnimateWhenVisible>
                            );
                        })}
                    </div>
                </section>

                {/* FEATURED BRANDS */}
                <section className="px-6 md:px-12 py-24 bg-[#ebe8e3]/50 my-24 border-y border-outline-variant/10 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto relative z-10">
                        <AnimateWhenVisible direction="fade">
                            <h2 className="text-center text-sm font-manrope font-bold uppercase tracking-[0.3em] text-[#46483c] mb-16 flex items-center justify-center gap-4">
                                <span className="w-12 h-px bg-[#46483c]/30"></span>
                                Các nhà mốt lưu trữ
                                <span className="w-12 h-px bg-[#46483c]/30"></span>
                            </h2>
                        </AnimateWhenVisible>
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
                            {[
                                { name: 'CHANEL', class: 'font-serif font-bold tracking-tight' },
                                { name: 'PRADA', class: 'font-manrope font-light tracking-widest' },
                                { name: 'Céline', class: 'font-serif font-bold italic' },
                                { name: 'GUCCI', class: 'font-manrope font-bold tracking-tighter' },
                                { name: 'HERMÈS', class: 'font-serif tracking-widest' }
                            ].map((brand, i) => (
                                <AnimateWhenVisible key={brand.name} direction="fadeInUp" transition={{ delay: i * 0.1 }}>
                                    <span className={`text-3xl md:text-4xl text-[#1c1c19] opacity-50 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-all duration-500 cursor-pointer inline-block ${brand.class}`}>
                                        {brand.name}
                                    </span>
                                </AnimateWhenVisible>
                            ))}
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-white/40 blur-3xl rounded-full z-0 pointer-events-none"></div>
                </section>

                {/* CURATED CATEGORIES */}
                <section className="px-6 md:px-12 pb-32 max-w-7xl mx-auto">
                    <AnimateWhenVisible direction="fade" className="flex justify-between items-end mb-16">
                        <div>
                            <h2 className="text-5xl font-notoSerif font-bold mb-4 text-on-background tracking-tight relative inline-block">
                                Khám phá theo dòng
                                <span className="absolute -bottom-2 left-0 w-16 h-1 bg-primary rounded-full"></span>
                            </h2>
                            <p className="text-on-surface-variant font-manrope text-lg mt-4">Tuyển tập thẩm mỹ được cá nhân hóa cho phong cách của bạn.</p>
                        </div>
                        <button onClick={() => navigate('/products')} className="hidden md:flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-[0.2em] hover:opacity-80 hover:-translate-y-0.5 transition-all border-b border-primary/20 pb-1 group">
                            Xem toàn bộ Kho <span className="material-symbols-outlined text-base transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                    </AnimateWhenVisible>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
                        {categories.slice(0, 4).map((cat, idx) => {
                            // Zigzag layout for 4 columns
                            const offsetClass = idx % 2 === 1 ? 'md:mt-16' : '';
                            const customImage = defaultCategoryImages[idx] || cat.image;

                            return (
                                <AnimateWhenVisible
                                    key={cat._id || idx}
                                    direction="fadeInUp"
                                    transition={{ delay: 0.1 * (idx + 1) }}
                                    className={`group cursor-pointer relative ${offsetClass}`}
                                    onClick={() => navigate(`/products?category=${cat._id}`)}
                                >
                                    <div className="aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden shadow-lg relative bg-surface-container-high">
                                        <img
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out filter grayscale group-hover:grayscale-0"
                                            alt={cat.name}
                                            src={customImage}
                                        />
                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>
                                        
                                        {/* Text content */}
                                        <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                                            <h3 className="font-serif text-3xl font-bold text-white mb-3 group-hover:-translate-y-2 transition-transform duration-500 drop-shadow-md">{cat.name}</h3>
                                            <div className="h-0.5 w-0 bg-white group-hover:w-16 transition-all duration-[0.8s] ease-out mb-4 shadow-sm"></div>
                                            <p className="text-xs text-white/95 font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-500 delay-100 flex items-center gap-2 drop-shadow-md">
                                                Khám phá <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
                                            </p>
                                        </div>
                                    </div>
                                </AnimateWhenVisible>
                            );
                        })}
                    </div>
                </section>

                {/* AUTHENTICATION SNIPPET */}
                <section className="px-6 md:px-12 pb-32 max-w-[1400px] mx-auto">
                    <div className="bg-[#4c6545] text-white rounded-[2.5rem] p-12 md:p-20 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden group">
                        <div className="md:w-1/2 z-10">
                            <AnimateWhenVisible direction="fadeInDown">
                                <span className="font-manrope text-xs font-bold uppercase tracking-[0.3em] text-[#ceebc2] mb-6 block flex items-center gap-3">
                                    <span className="w-8 h-px bg-[#ceebc2]"></span>
                                    Bảo chứng niềm tin
                                </span>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-8 leading-[1.1]">Xác minh<br /><i className="italic font-light">thủ công.</i></h2>
                                <p className="font-manrope text-[#ceebc2]/90 leading-relaxed mb-10 text-lg">
                                    Mọi món đồ gia nhập Atelier đều trải qua quy trình kiểm định 12 bước bởi các chuyên gia độc lập. Chúng tôi soi xét vi mô từng mảng nếp da đến hệ thống mũi chỉ, đảm bảo mức độ nguyên bản cao nhất.
                                </p>
                                <div className="flex gap-4">
                                    <button onClick={() => navigate('/sustain')} className="px-8 py-4 bg-[#fcf9f4] text-[#4c6545] font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-white hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-3">
                                        Tìm hiểu Quy trình
                                        <span className="material-symbols-outlined text-lg">verified_user</span>
                                    </button>
                                </div>
                            </AnimateWhenVisible>
                        </div>
                        <div className="md:w-1/2 w-full z-10">
                            <AnimateWhenVisible direction="slideFromRight">
                                <div className="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl relative">
                                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s] ease-out" alt="Authentication process" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJeHNf5J1Lk3qDlDkHdtsf4UiJ_aSxitcwfkaxRqJ3UkCClLkUQz5qCWLa9lBz1Sc9CUC1dJVNUFHhr7V8a9RnpcweY4-x7Fh9Dv9FNozJB_EC2WokG4bb7ce3CztdmZuCpMdSc28iLTd5zSD-VXTWpfVVD-togdturE3dP3Mn8DC4WqBFAiMSCxMJKt7gFAgQpTa1Z2CVJdidtZ0XFIOoKpa0OqcxUzSeH2NJKJrd0y2Xtoe_qJs8FFbnqyJIWHXazIq0SfIkV2iH" />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#4c6545]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
                                </div>
                            </AnimateWhenVisible>
                        </div>

                        {/* Background decoration */}
                        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#809b77] blur-[140px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-1000 z-0 pointer-events-none"></div>
                        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-[#3a4d34] blur-[100px] rounded-full opacity-30 z-0 pointer-events-none"></div>
                    </div>
                </section>
            </main>
        </div>
    );
}