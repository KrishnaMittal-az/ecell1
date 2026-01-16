import { useEffect, useRef, useState } from "react"

export const Gallery = () => {
    let ref = useRef();
    const [currentImg, setCurrentImg] = useState("");
    const [closeIcon, setCloseIcon] = useState('d-none')

    const showFullImg = (e) => {
        if (window.innerWidth < 768) {
            return;
        }
        let nextSibling = e.target.nextElementSibling;
        let imgSrc = nextSibling.src;
        setCurrentImg(imgSrc);
        ref.current.classList.add("open")
        setCloseIcon('d-block');
    }


    useEffect(() => {
        document.body.style.backgroundImage = "none";

        const header = document.getElementById("header");
        const footer = document.getElementById("footer");
        if (header) header.style.top = "0%";
        if (footer) footer.style.display = "block";
    }, [])




    return (
        <>
            <div className="section-title" style={{ marginTop: "100px" }}>
                <h2>Gallery</h2>
            </div>
            <div id="gallery" className="section ">

                <div className="container" style={{ marginTop: "100px" }}>

                    <div className="row1">
                        {Array.from({ length: 12 }, (_, index) => (
                            <div className="column" key={index}>
                                <div className="gal_item">
                                    <div className="overlay-gall" onClick={showFullImg}></div>
                                    < img src={`assets/images/gallery/${index + 1}.JPG`} alt="" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="galleryModal " ref={ref}>
                    <div className="imgContainer">
                        <img src={currentImg} alt="img" />
                    </div>
                </div>
                <div onClick={() => { ref.current.classList.remove("open"); setCloseIcon('d-none') }} className={`close ${closeIcon}`}>&times;</div>
            </div>


        </>
    )
}
