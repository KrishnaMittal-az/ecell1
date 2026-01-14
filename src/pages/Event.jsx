import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useEffect } from 'react';

export const Events = () => {
    useEffect(() => {
        document.body.style.backgroundImage = "url(assets/images/Workshops/WebsiteBG-01-01-01-01-01.jpg)";
        document.body.style.backgroundAttachment = "fixed";
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPsition = "center";
        const header = document.getElementById("header");
        const footer = document.getElementById("footer");
        if (header) header.style.top = "-100%"; 
        if (footer) footer.style.display = "none"; 
    }, [])

    return (
        <>

            <section id="testimonials" className="testimonials" style={{ position: "relative", paddingTop: "1%", top: "0%" }}>
                <div className="container" style={{position: "relative"}} data-aos="fade-up">
                  
                    <div className="section-title">
                        <img src="assets/images/Workshops/E-Conclave Logo (White).png" alt="" className="logo1" style={{ paddingBottom: "50px" }} />
                        <h2 style={{ color: "white" }}>Register for our Events</h2>
                    </div>

                    <Swiper className="testimonials-slider swiper" pagination={true} loop={true} autoplay={{ delay: 2500 }} spaceBetween={25} centeredSlides={true} modules={[Autoplay, Pagination]} breakpoints={{
                        320: {
                            slidesPerView: 1,
                            spaceBetween: 20
                        },

                        1200: {
                            slidesPerView: 3,
                            spaceBetween: 20
                        }
                    }}>
                        <div className="swiper-wrapper">


                            <SwiperSlide className="swiper-slide d-flex align-items-stretch">
                                <div className="member" data-aos="fade-up" data-aos-delay="300">
                                    <div className="member-img" style={{ position: "relative" }}>
                                        <img src="assets/images/Workshops/UTOPIA.jpg" className="img-fluid" alt="" />

                                    </div>
                                    <div className="member-info">
                                        <a target="_blank" className="get-started-btn scrollto ticket"><h6 style={{ fontWeight: "bolder", position: "relative", top: "5%", fontSize: "20px" }}>REGISTER</h6></a>
                                    </div>


                                </div>

                            </SwiperSlide>

                            <SwiperSlide className="swiper-slide d-flex align-items-stretch">
                                <div className="member" data-aos="fade-up" data-aos-delay="300">
                                    <div className="member-img" style={{ position: "relative" }}>
                                        <img src="assets/images/Workshops/BTB.jpg" className="img-fluid" alt="" />

                                    </div>
                                    <div className="member-info">
                                        <a href='https://forms.gle/jBs6UxZ67ShyYUNc8' target="_blank" className="get-started-btn scrollto ticket"><h6 style={{ fontWeight: "bolder", position: "relative", top: "5%", fontSize: "20px" }}>REGISTER</h6></a>

                                    </div>
                                </div>
                            </SwiperSlide>

                            <SwiperSlide className="swiper-slide d-flex align-items-stretch">
                                <div className="member" data-aos="fade-up" data-aos-delay="300">
                                    <div className="member-img" style={{ position: "relative" }}>
                                        <img src="assets/images/Workshops/IDEATHON.jpg" className="img-fluid" alt="" />

                                    </div>
                                    <div className="member-info">
                                        <a href='https://forms.gle/k8yhN6HmLYe1hMA2A' target="_blank" className="get-started-btn scrollto ticket"><h6 style={{ fontWeight: "bolder", position: "relative", top: "5%", fontSize: "20px" }}>REGISTER</h6></a>

                                    </div>
                                </div>
                            </SwiperSlide>

                            <SwiperSlide className="swiper-slide d-flex align-items-stretch">
                                <div className="member" data-aos="fade-up" data-aos-delay="300">
                                    <div className="member-img" style={{ position: "relative" }}>
                                        <img src="assets/images/Workshops/sTARTUPEXPO.jpg" className="img-fluid" alt="" />

                                    </div>
                                    <div className="member-info">
                                        <a href='https://forms.gle/e3AZxyYRCsVQ1HL29' target="_blank" className="get-started-btn scrollto ticket"><h6 style={{ fontWeight: "bolder", position: "relative", top: "5%", fontSize: "20px" }}>REGISTER</h6></a>

                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide className="swiper-slide d-flex align-items-stretch">
                                <div className="member" data-aos="fade-up" data-aos-delay="300">
                                    <div className="member-img" style={{ position: "relative" }}>
                                        <img src="assets/images/Workshops/W1.jpg" className="img-fluid" alt="" />

                                    </div>
                                    <div className="member-info">
                                        <a href='https://forms.gle/njfjkHCWPwAFDWHN7' target="_blank" className="get-started-btn scrollto ticket"><h6 style={{ fontWeight: "bolder", position: "relative", top: "5%", fontSize: "20px" }}>REGISTER</h6></a>

                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide className="swiper-slide d-flex align-items-stretch">
                                <div className="member" data-aos="fade-up" data-aos-delay="300">
                                    <div className="member-img" style={{ position: "relative" }}>
                                        <img src="assets/images/Workshops/CROWDPITCH.jpg" className="img-fluid" alt="" />

                                    </div>
                                    <div className="member-info">
                                        <a href='https://forms.gle/nVx2Eij7UTwxHMJi9' target="_blank" className="get-started-btn scrollto ticket"><h6 style={{ fontWeight: "bolder", position: "relative", top: "5%", fontSize: "20px" }}>REGISTER</h6></a>

                                    </div>
                                </div>
                            </SwiperSlide>






                        </div>
                        <div className="swiper-pagination"></div>
                    </Swiper>

                </div>
            </section>




            <a href="#" className="back-to-top d-flex align-items-center justify-content-center"><i className="bi bi-arrow-up-short"></i></a>

        </>
    )
}
