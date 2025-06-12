import { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from "swiper/modules";
import 'swiper/css';
import 'swiper/css/navigation';
import {useLoaderData} from 'react-router-dom'


export const TeamCouncil = () => {
    const data = useLoaderData();
    const [activeSlider, setActiveSlider] = useState("1");
    const [councilText, setCouncilText] = useState("Meet E-Cell 1.0");
    useEffect(() => {
        document.body.style.backgroundImage = "none";
        document.getElementById("header").style.top = "0%"; 
        document.getElementById("footer").style.display = "block"; 
        
        const hash = window.location.hash;
        if (hash) {
            const splitHash = hash.split("-");
            if (splitHash[1] !== "1") {
                setActiveSlider(splitHash[1]);
                setCouncilText(`Meet E-Cell ${splitHash[1]}.0`)
            }

        }
    }, [])
    const changeTeam = (team) => {
        switch (team) {
            case '1':
                setActiveSlider("1");
                setCouncilText("Meet E-Cell 1.0");
                break;
            case '2':
                setActiveSlider("2");
                setCouncilText("Meet E-Cell 2.0");
                break;
            case '3':
                setActiveSlider("3");
                setCouncilText("Meet E-Cell 3.0");
                break;
            case '4':
                setActiveSlider("4");
                setCouncilText("Meet E-Cell 4.0");
                break;
            case '5':
                setActiveSlider("5");
                setCouncilText("Meet E-Cell 5.0");
                break;
            case '6':
                setActiveSlider("6");
                setCouncilText("Meet E-Cell 6.0");
                break;
            case '7':
                setActiveSlider("7");
                setCouncilText("Meet E-Cell 7.0");
                break;
            case '9':
                setActiveSlider("9");
                setCouncilText("Meet E-Cell 9.0");
                break;
            case '10':
                setActiveSlider("10");
                setCouncilText("Meet E-Cell 10.0");
                break;
            case '11':
                setActiveSlider("11");
                setCouncilText("Meet E-Cell 11.0");
                break;

            default:
                break;
        }

    }


    return (
        <>
            <nav id="council-nav" className="team-council order-last order-lg-0" style={{ marginTop: "8rem" }}>
                <ul>
                    <li><a onClick={() => { changeTeam('1') }} style={{ fontFamily: "Arial, Helvetica,sans-serif", cursor: "pointer" }} className={`${activeSlider == '1' && 'active'}`}>E-Cell 1.0</a></li>
                    <li><a onClick={() => { changeTeam('2') }} style={{ fontFamily: "Arial, Helvetica, sans-serif", cursor: "pointer" }} className={`${activeSlider == '2' && 'active'}`}>E-Cell 2.0</a></li>
                    <li><a onClick={() => { changeTeam('3') }} style={{ fontFamily: "Arial, Helvetica ,sans-serif", cursor: "pointer" }} className={`${activeSlider == '3' && 'active'}`}>E-Cell 3.0</a></li>
                    <li><a onClick={() => { changeTeam('4') }} style={{ fontFamily: "Arial, Helvetica ,sans-serif", cursor: "pointer" }} className={`${activeSlider == '4' && 'active'}`}>E-Cell 4.0</a></li>
                    <li><a onClick={() => { changeTeam('5') }} style={{ fontFamily: "Arial, Helvetica ,sans-serif", cursor: "pointer" }} className={`${activeSlider == '5' && 'active'}`}>E-Cell 5.0</a></li>
                    <li><a onClick={() => { changeTeam('6') }} style={{ fontFamily: "Arial, Helvetica ,sans-serif", cursor: "pointer" }} className={`${activeSlider == '6' && 'active'}`}>E-Cell 6.0</a></li>
                    <li><a onClick={() => { changeTeam('7') }} style={{ fontFamily: "Arial, Helvetica ,sans-serif", cursor: "pointer" }} className={`${activeSlider == '7' && 'active'}`}>E-Cell 7.0</a></li>
                    <li><a onClick={() => { changeTeam('9') }} style={{ fontFamily: "Arial, Helvetica ,sans-serif", cursor: "pointer" }} className={`${activeSlider == '9' && 'active'}`}>E-Cell 9.0</a></li>
                    <li><a onClick={() => { changeTeam('10') }} style={{ fontFamily: "Arial, Helvetica ,sans-serif", cursor: "pointer" }} className={`${activeSlider == '10' && 'active'}`}>E-Cell 10.0</a></li>
                    <li><a onClick={() => { changeTeam('11') }} style={{ fontFamily: "Arial, Helvetica ,sans-serif", cursor: "pointer" }} className={`${activeSlider == '11' && 'active'}`}>E-Cell 11.0</a></li>
                </ul>
            </nav>

            <section id="team" className="team section-bg" >
                <div>
                    <div >
                        <div>
                            <Swiper className="container ml-5 d-flex flex-column-reverse" data-aos="fade-up" 
                            navigation={false} 
                            loop={true} 
                            autoplay={{ delay: 1000, disableOnInteraction:false, pauseOnMouseEnter: false }} 
                            // speed = {300} 
                            centeredSlides={true} 
                            modules={[Autoplay, Navigation]} 
                            breakpoints={{
                                320: {
                                    slidesPerView: 1,
                                    spaceBetween: 20
                                },
                                768: {
                                    slidesPerView: 3,
                                    spaceBetween: 20
                                },
                                1200: {
                                    slidesPerView: 4,
                                    spaceBetween: 20
                                }
                            }} >
                                <div className="section-title">
                                    <h2>{councilText}</h2>
                                </div>

                                {/* { */}
                                <div className="row">
                                    {data &&
                                        data[`${activeSlider}.0`].map((member, index) => {
                                            return (
                                                <SwiperSlide className="col-lg-3 col-md-6 d-flex align-items-stretch justify-content-center">
                                                    <div className="member" data-aos="fade-up" data-aos-delay="100">
                                                        <div className="member-img">
                                                            <img src={member.imgUrl} className="img-fluid" alt="" />
                                                            <div className="social">
                                                                <a href={member.linkedinUrl} target="blank"><i className="bi bi-linkedin"></i></a>
                                                                {
                                                                    member.instagramUrl &&
                                                                    <a href={member.instagramUrl} target="blank"><i className="bi bi-instagram"></i></a>
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="member-info">
                                                            <h4>{member.name}</h4>
                                                            <span>{member.rank}</span>
                                                        </div>
                                                    </div>
                                                </SwiperSlide>
                                            )
                                        })}
                                </div>

                            </Swiper>

                        </div>

                    </div>
                </div>
            </section>
        </>
    )
}