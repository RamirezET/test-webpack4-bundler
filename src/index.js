import "@babel/polyfill";
import "swiper/dist/css/swiper.css";
import "@/styles/index.scss"; // global css
import Swiper from "swiper";
import { $ } from "@/utils";
import pic from "../static/surf-the-internet.jpg"

window.onload = () => {
  new Swiper(".swiper-container", {
    autoplay: {
      delay: 1000,
      stopOnLastSlide: false,
      disableOnInteraction: false
    }
  });
  const showText = "守护姨父的微笑";
  const changeTitle = () => {
    let myPromise = new Promise((resolve, reject) => {
      resolve();
    });
    return myPromise;
  };

  changeTitle().then(() => {
    $(".title").innerHTML = `我们要${showText}`;
    const lists = [...document.querySelectorAll(".list-item")];
    lists.forEach(element => {
      console.log(element);
    });
    setTimeout(() => {
      let [a, b, c] = ["索尼好！退果报平安", 2, 3];
      console.log(a);
      $(".title").innerHTML = `我们要${showText}${a}`;
      $("#pic").setAttribute("src", pic);
    },1000);
  });
};
