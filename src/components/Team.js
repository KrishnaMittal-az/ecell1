import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { Link } from 'react-router-dom';


export const Team = () => {
    return (
        <section id="team" className="pricing section-bg">
            <div className="section-title">
                <h2>Student Council</h2>
            </div>
            <Swiper pagination={false} loop={true} autoplay={{ delay: 1000,}} spaceBetween={25} centeredSlides={true} modules={[Autoplay, Pagination]} breakpoints={{
                320: {
                    slidesPerView: 1,
                    spaceBetween: 20
                },

                1200: {
                    slidesPerView: 3,
                    spaceBetween: 20
                }
            }} >
                <SwiperSlide className="my-card"><Link to='/councils#council-1' className="scrollto team-link"
                    style={{ position: "relative", top: "87%" }}>
                    <img src='assets/images/StudentCouncilActive-01.png' />
                    <span className='text-center team-link-btn'>Team Council 1.0</span>
                </Link>
                </SwiperSlide>
                <SwiperSlide className="my-card"><Link to="/councils#council-2" className="scrollto team-link"
                    style={{ position: "relative", top: "87%" }}>
                    <img src='assets/images/StudentCouncilActive-01.png' />
                    <span className='text-center team-link-btn'>Team Council 2.0</span>
                </Link>
                </SwiperSlide>
                <SwiperSlide className="my-card"><Link to="/councils#council-3" className="scrollto team-link"
                    style={{ position: "relative", top: "87%" }}>
                    <img src='assets/images/StudentCouncilActive-01.png' />
                    <span className='text-center team-link-btn'>Team Council 3.0</span>
                </Link>
                </SwiperSlide>
                <SwiperSlide className="my-card"><Link to="/councils#council-4" className="scrollto team-link"
                    style={{ position: "relative", top: "87%" }}>
                    <img src='assets/images/StudentCouncilActive-01.png' />
                    <span className='text-center team-link-btn'>Team Council 4.0</span>
                </Link>
                </SwiperSlide>
                <SwiperSlide className="my-card"><Link to="/councils#council-5" className="scrollto team-link"
                    style={{ position: "relative", top: "87%" }}>
                    <img src='assets/images/StudentCouncilActive-01.png' />
                    <span className='text-center team-link-btn'>Team Council 5.0</span>
                </Link>
                </SwiperSlide>
                <SwiperSlide className="my-card"><Link to="/councils#council-6" className="scrollto team-link"
                    style={{ position: "relative", top: "87%" }}>
                    <img src='assets/images/StudentCouncilActive-01.png' />
                    <span className='text-center team-link-btn'>Team Council 6.0</span>
                </Link>
                </SwiperSlide>
                <SwiperSlide className="my-card"><Link to="/councils#council-7" className="scrollto team-link"
                    style={{ position: "relative", top: "87%" }}>
                    <img src='assets/images/StudentCouncilActive-01.png' />
                    <span className='text-center team-link-btn'>Team Council 7.0</span>
                </Link>
                </SwiperSlide>
                <SwiperSlide className="my-card"><Link to="/councils#council-9" className="scrollto team-link"
                    style={{ position: "relative", top: "87%" }}>
                    <img src='assets/images/StudentCouncilActive-01.png' />
                    <span className='text-center team-link-btn'>Team Council 9.0</span>
                </Link>
                </SwiperSlide>
                <SwiperSlide className="my-card"><Link to="/councils#council-10" className="scrollto team-link"
                    style={{ position: "relative", top: "87%" }}>
                    <img src='assets/images/StudentCouncilActive-01.png' />
                    <span className='text-center team-link-btn'>Team Council 10.0</span>
                </Link>
                </SwiperSlide>
                <SwiperSlide className="my-card"><Link to="/councils#council-11" className="scrollto team-link"
                    style={{ position: "relative", top: "87%" }}>
                    <img src='assets/images/StudentCouncilActive-01.png' />
                    <span className='text-center team-link-btn'>Team Council 11.0</span>
                </Link>
                </SwiperSlide>
            </Swiper>
            {/* <script src="https://code.jquery.com/jquery-3.3.1.min.js"
                integrity="sha384-tsQFqpEReu7ZLhBV2VZlAu7zcOV+rXbYlF2cqB8txI/8aZajjp4Bqd+V6D5IgvKT"
                crossOrigin="anonymous"></script> */}



        </section>
    )
}
