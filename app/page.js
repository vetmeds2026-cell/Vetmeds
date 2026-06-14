import Header from "./_components/Header";
import Hero from "./_components/Hero";
import Footer from "./_components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
<div className="relative w-full h-screen overflow-hidden">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src={`https://res.cloudinary.com/dgkinq01v/video/upload/v1781253118/nsk8tgcvsyw0zv8xtatd.mp4`} 
        autoPlay
        loop
        muted
        playsInline
      />

     
      <div className="absolute inset-0 bg-black/20"></div>
      <div 
        className="flex-grow "
       
      >
        <Header/>
        <Hero />  
      </div>
    </div>



     
      <Footer />
    </div>
  );
}
