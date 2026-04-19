import { useEffect, useState } from "react";
import AnimateWhenVisible from "../../helpers/animationScroll";
import productImagesModel from "../../assets/images/product_ex.png";
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
                        <div className="inline-flex items-center px-4 py-1.5 bg-orange-600/10 border border-orange-600/20 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest w-fit mb-2"
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
                            <button className="px-8 py-4 bg-orange-600 text-white rounded-xl font-bold tracking-widest text-sm uppercase hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-orange-600/20"
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
                        <div className="w-full max-h-[70vh] md:max-h-[80vh] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10 relative group bg-slate-100">
                            <img
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                                alt="featured product"
                                src={products[0]?.images?.find(img => img.isPrimary)?.imageUrl || products[0]?.images?.[0]?.imageUrl || productImagesModel}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                            <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-orange-600 mb-2 block">Archive Nổi Bật</span>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h3 className="font-serif text-2xl font-bold text-slate-900">{products[0]?.title || 'Sản phẩm tiêu biểu'}</h3>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-slate-600">${products[0]?.price}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AnimateWhenVisible>
                </section>

                {/* NEW ARRIVALS */}
                <section className="px-6 max-w-7xl mx-auto mb-24">
                    <AnimateWhenVisible className="flex justify-between items-center mb-16">
                        <h2 className="text-4xl font-notoSerif font-bold text-on-background">Sản phẩm mới</h2>
                        <button 
                            onClick={() => navigate('/products')} 
                            className="text-primary font-bold text-sm border-b border-primary pb-1 hover:opacity-80 transition-opacity"
                        >
                            Xem tất cả Kho
                        </button>
                    </AnimateWhenVisible>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-16 gap-x-8">
                        {products.slice(0, 5).map((item, index) => {
                            // Define asymmetric aspect ratios based on index to create the editorial look
                            const aspectRatios = [
                                'aspect-[3/4]',    // 0
                                'aspect-[3/5]',    // 1 (Tall center)
                                'aspect-[3/4]',    // 2
                                'aspect-[3/4]',    // 3
                                'aspect-[3/4]',    // 4
                            ];
                            
                            // Apply specific column/row spans or margins to mimic the design
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
                                    className={`group cursor-pointer ${containerClasses}`}
                                    onClick={() => navigate(`/products/${item.slug}`)}
                                >
                                    <div className={`${aspectRatios[index] || 'aspect-[3/4]'} rounded-lg overflow-hidden bg-surface-container-high mb-4`}>
                                        <img
                                            src={item.images?.find(img => img.isPrimary)?.imageUrl || item.images?.[0]?.imageUrl || 'LINK_ẢNH_MẶC_ĐỊNH_KHI_TRỐNG'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            alt={item.title}
                                        />
                                    </div>
                                    
                                    <span className="inline-block px-2 py-0.5 bg-tertiary-container text-on-tertiary-container text-[9px] font-bold rounded mb-2 uppercase tracking-wider">
                                        Verified
                                    </span>
                                    
                                    <h4 className="font-manrope font-semibold text-lg text-on-background line-clamp-1">
                                        {item.title}
                                    </h4>
                                    
                                    <p className="text-on-surface-variant text-sm mb-2 line-clamp-1">
                                        {item.color} • {item.material}
                                    </p>
                                    
                                    <span className="text-primary font-bold">
                                        ${item.price}
                                    </span>
                                </AnimateWhenVisible>
                            );
                        })}
                    </div>
                </section>

                {/* FEATURED BRANDS */}
                <section className="px-6 md:px-12 py-24 bg-[#ebe8e3]/50 my-16 border-y border-outline-variant/10">
                    <div className="max-w-7xl mx-auto">
                        <AnimateWhenVisible direction="fade">
                            <h2 className="text-center text-sm font-manrope font-bold uppercase tracking-[0.3em] text-[#46483c] mb-12">
                                Các nhà mốt lưu trữ
                            </h2>
                        </AnimateWhenVisible>
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                            <AnimateWhenVisible direction="fadeInUp" transition={{ delay: 0.1 }}><span className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#1c1c19]">CHANEL</span></AnimateWhenVisible>
                            <AnimateWhenVisible direction="fadeInUp" transition={{ delay: 0.2 }}><span className="font-manrope text-3xl md:text-4xl font-light tracking-widest text-[#1c1c19]">PRADA</span></AnimateWhenVisible>
                            <AnimateWhenVisible direction="fadeInUp" transition={{ delay: 0.3 }}><span className="font-serif text-3xl md:text-4xl font-bold italic text-[#1c1c19]">Céline</span></AnimateWhenVisible>
                            <AnimateWhenVisible direction="fadeInUp" transition={{ delay: 0.4 }}><span className="font-manrope text-3xl md:text-4xl font-bold tracking-tighter text-[#1c1c19]">GUCCI</span></AnimateWhenVisible>
                            <AnimateWhenVisible direction="fadeInUp" transition={{ delay: 0.5 }}><span className="font-serif text-3xl md:text-4xl tracking-widest text-[#1c1c19]">HERMÈS</span></AnimateWhenVisible>
                        </div>
                    </div>
                </section>

                {/* CURATED CATEGORIES */}
                <section className="px-6 md:px-12 pb-32 max-w-7xl mx-auto">
                    <AnimateWhenVisible direction="fade" className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-4xl font-notoSerif font-bold mb-3 text-on-background">Khám phá theo Dòng</h2>
                            <p className="text-on-surface-variant font-manrope">Tuyển tập thẩm mỹ được cá nhân hóa cho phong cách của bạn.</p>
                        </div>
                        <button onClick={() => navigate('/products')} className="hidden md:flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest hover:opacity-80 transition-all border-b border-primary/20 pb-1">
                            Xem toàn bộ Kho <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </button>
                    </AnimateWhenVisible>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {categories.slice(0, 4).map((cat, idx) => (
                            <AnimateWhenVisible 
                                key={cat._id || idx} 
                                direction="fadeInUp" 
                                transition={{ delay: 0.1 * (idx + 1) }}
                                className="group cursor-pointer relative aspect-[4/5] rounded-xl overflow-hidden shadow-sm"
                                onClick={() => navigate(`/products?category=${cat._id}`)}
                            >
                                <img 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                    alt={cat.name} 
                                    src={cat.image || `https://images.unsplash.com/photo-${[
                                        '1584916201218-f4242ceb4809', // Minimalism
                                        '1620799140408-edc6dcb6d633', // Outerwear
                                        '1583337130417-33464d6648e2', // Denim
                                        '1583337130417-33464d6648e3'  // Watches
                                    ][idx]}?q=80&w=1000&auto=format&fit=crop`} 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <h3 className="font-notoSerif text-xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform duration-500">{cat.name}</h3>
                                    <p className="text-xs text-white/70 font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        Khám phá ngay
                                    </p>
                                </div>
                            </AnimateWhenVisible>
                        ))}
                    </div>
                </section>

                {/* AUTHENTICATION SNIPPET */}
                <section className="px-6 md:px-12 pb-32 max-w-[1400px] mx-auto">
                    <div className="bg-[#4c6545] text-white rounded-[2rem] p-12 md:p-20 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
                        <div className="md:w-1/2 z-10">
                            <AnimateWhenVisible direction="fadeInDown">
                                <span className="font-manrope text-xs font-bold uppercase tracking-[0.3em] text-[#ceebc2] mb-6 block">Bảo chứng niềm tin</span>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-8 leading-[1.1]">Xác minh<br /><i className="italic font-light">thủ công.</i></h2>
                                <p className="font-manrope text-[#ceebc2]/90 leading-relaxed mb-10 text-lg">
                                    Mọi món đồ gia nhập Atelier đều trải qua quy trình kiểm định 12 bước bởi các chuyên gia độc lập. Chúng tôi soi xét vi mô từng mảng nếp da đến hệ thống mũi chỉ, đảm bảo mức độ nguyên bản cao nhất.
                                </p>
                                <div className="flex gap-4">
                                    <button onClick={() => navigate('/sustain')} className="px-8 py-4 bg-[#fcf9f4] text-[#4c6545] font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-white transition-colors hover:scale-105 active:scale-95">
                                        Tìm hiểu Quy trình
                                    </button>
                                </div>
                            </AnimateWhenVisible>
                        </div>
                        <div className="md:w-1/2 w-full z-10">
                            <AnimateWhenVisible direction="slideFromRight">
                                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                                    <img className="w-full h-full object-cover" alt="Authentication process" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJeHNf5J1Lk3qDlDkHdtsf4UiJ_aSxitcwfkaxRqJ3UkCClLkUQz5qCWLa9lBz1Sc9CUC1dJVNUFHhr7V8a9RnpcweY4-x7Fh9Dv9FNozJB_EC2WokG4bb7ce3CztdmZuCpMdSc28iLTd5zSD-VXTWpfVVD-togdturE3dP3Mn8DC4WqBFAiMSCxMJKt7gFAgQpTa1Z2CVJdidtZ0XFIOoKpa0OqcxUzSeH2NJKJrd0y2Xtoe_qJs8FFbnqyJIWHXazIq0SfIkV2iH" />
                                </div>
                            </AnimateWhenVisible>
                        </div>

                        {/* Background decoration */}
                        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#809b77] blur-[120px] rounded-full opacity-40 z-0"></div>
                    </div>
                </section>
            </main>
        </div>
    );
}