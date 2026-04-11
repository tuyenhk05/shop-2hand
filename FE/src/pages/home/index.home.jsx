import { useEffect, useState } from "react";
import AnimateWhenVisible from "../../helpers/animationScroll";
import productImagesModel from "../../assets/images/product_ex.png";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../../services/products";
import Loading from "../../components/loading/loading";
import useScrollToTop from "../../hooks/useScrollToTop";

export default function Home() {
    useScrollToTop();
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const dataFetch = async () => {
            setLoading(true); // Bắt đầu loading
            const result = await getAllProducts();
            if (result.success) {
                setProducts(result.data);
                setLoading(false); // Kết thúc loading sau khi fetch xong

            } else {
                console.error('Failed to fetch products:', result.message);
                setLoading(false); // Kết thúc loading sau khi fetch xong

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
                                alt="high-end vintage wool coat"
                                src={productImagesModel}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                            <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-orange-600 mb-2 block">Archive Nổi Bật</span>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h3 className="font-serif text-2xl font-bold text-slate-900">1982 Heritage Trench</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AnimateWhenVisible>
                </section>

                {/* NEW ARRIVALS */}
                <section className="px-6 max-w-6xl mx-auto pb-16">
                    <AnimateWhenVisible>
                        <h2 className="text-2xl font-bold mb-7">Sản phẩm mới</h2>
                    </AnimateWhenVisible>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 items-start">
                        {products.slice(0, 6).map((item, index) => (
                            <AnimateWhenVisible
                                key={item.id}
                                direction="fadeInUp"
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className={`
                    ${index % 2 !== 0 ? 'mt-8 md:mt-0' : ''} 
                    ${index % 3 === 1 ? 'md:mt-8' : ''} 
                    ${index % 3 === 2 ? 'md:mt-16' : ''}
                `}
                            >
                                <div className="group cursor-pointer"
                                    onClick={() => navigate(`/products/${item.slug}`)}

                                >
                                    <div className="aspect-[2/3] mb-3 overflow-hidden rounded-xl shadow-sm border border-outline-variant/10">
                                        <img
                                            src={item.images?.find(img => img.isPrimary)?.imageUrl || item.images?.[0]?.imageUrl || 'LINK_ẢNH_MẶC_ĐỊNH_KHI_TRỐNG'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-700 mix-blend-multiply"
                                            alt={item.title}
                                        />
                                    </div>
                                    <h4 className="font-semibold text-base line-clamp-1">{item.title}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5 mb-1.5 line-clamp-2">{item.color} - {item.material}</p>
                                    <span className="text-[#728C69] font-bold text-base">
                                        ${item.price}
                                    </span>
                                </div>
                            </AnimateWhenVisible>
                        ))}
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
                            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-[#1c1c19]">Khám phá theo Dòng</h2>
                            <p className="text-[#46483c] font-manrope">Tuyển tập thẩm mỹ được cá nhân hóa.</p>
                        </div>
                        <button onClick={() => navigate('/products')} className="hidden md:flex items-center gap-2 text-[#4c6545] font-bold text-sm uppercase tracking-widest hover:opacity-80">
                            Xem toàn bộ Kho <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </button>
                    </AnimateWhenVisible>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <AnimateWhenVisible direction="fadeInUp" transition={{ delay: 0.1 }}>
                            <div className="group cursor-pointer" onClick={() => navigate('/products')}>
                                <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-[#ebe8e3] relative mb-6">
                                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Túi xách" src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1000&auto=format&fit=crop" />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors"></div>
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-[#1c1c19]">Túi Di Sản</h3>
                                <p className="text-sm text-[#46483c] font-medium mt-1">Lưu trữ nguyên bản</p>
                            </div>
                        </AnimateWhenVisible>

                        <AnimateWhenVisible direction="fadeInUp" transition={{ delay: 0.2 }}>
                            <div className="group cursor-pointer md:mt-16" onClick={() => navigate('/products')}>
                                <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-[#ebe8e3] relative mb-6">
                                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Quần áo mùa đông" src="https://tse1.explicit.bing.net/th/id/OIP.Mdufb72p0dvhQZBeOobq-QAAAA?w=450&h=630&rs=1&pid=ImgDetMain&o=7&rm=3" />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors"></div>
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-[#1c1c19]">Áo khoác Thanh lịch</h3>
                                <p className="text-sm text-[#46483c] font-medium mt-1">Tailoring thủ công</p>
                            </div>
                        </AnimateWhenVisible>

                        <AnimateWhenVisible direction="fadeInUp" transition={{ delay: 0.3 }}>
                            <div className="group cursor-pointer md:mt-32" onClick={() => navigate('/products')}>
                                <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-[#ebe8e3] relative mb-6">
                                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Phụ kiện" src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=1000&auto=format&fit=crop" />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors"></div>
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-[#1c1c19]">Phụ kiện Tinh tế</h3>
                                <p className="text-sm text-[#46483c] font-medium mt-1">Điểm nhấn thời trang</p>
                            </div>
                        </AnimateWhenVisible>
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