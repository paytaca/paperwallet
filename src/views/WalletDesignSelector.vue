<template>
  <div class="landing-container">

<header class="landing-header">
   <img src="@/assets/paytaca.jpg" alt="Paytaca Logo" class="site-logo">
   <a ref = "https://www.paytaca.com/" target = "_blank" class = "site-title" >Paytaca.com</a>
</header>

<div class="header-padding">
  <img src = "@/assets/paper5.png" class = "paper5-logo">
<h1 class="header-padding-text">Bitcoin Cash (BCH) Paper Wallet</h1>
</div>

<div class="wallet-design-selector">
  <h2>Step One - Choose Your Design</h2>
  <div class="design-grid">
    <div class="design-option" @click="selectDesign('design1')">
      <img src="@/assets/design1.png" alt="Design 1">
    </div>
    <div class="design-option" @click="selectDesign('design2')">
      <img src="@/assets/design2.png" alt="Design 2">
    </div>
    <div class="design-option" @click="selectDesign('design3')">
      <img src="@/assets/design3.png" alt="Design 3">
      </div>
    </div>
  </div>
</div>
</template>

<script>
import QRCode from "qrcode";

export default {
  data() {
    return {
      paymentDetails: "",
      hashedPublicKey: "",
      hashedPrivateKey: "",
      qrCodeDataPublic: "",
      qrCodeDataPrivate: ""
    };
  },
  created() {
    this.updateHashAndQR();
  },
  methods: {
    async hashWithSHA256(input) {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
    },
    async updateHashAndQR() {
      const defaultAmount = this.paymentDetails || "0 BCH";
      
      this.hashedPublicKey = await this.hashWithSHA256(defaultAmount + "public");
      this.hashedPrivateKey = await this.hashWithSHA256(defaultAmount + "private");
      
      this.qrCodeDataPublic = await QRCode.toDataURL(this.hashedPublicKey);
      this.qrCodeDataPrivate = await QRCode.toDataURL(this.hashedPrivateKey);
    },
    printWallet() {
      const printable = document.getElementById('printable-wallet');
      const newWindow = window.open('', '_blank');
      newWindow.document.write('<html><head><title>Print Wallet</title></head><body>');
      newWindow.document.write(printable.innerHTML);
      newWindow.document.write('</body></html>');
      newWindow.document.close();
      newWindow.print();
    }
  }
};
</script>

<style scoped>
.landing-container {
background-color: white;
display: flex;
flex-direction: column;
align-items: center;
min-height: 20vh;
min-width: 20vw;
font-family: "Poppins", sans-serif;
width: 98.4%;
padding: flex;
}

.landing-header {
background-color: white;
width: 100%;
padding: 5px 15px;
position: fixed;
top: 0;
left: 0;
display: flex;
align-items: center; 
gap: 10px; 
z-index: 1000;
}

.site-logo {
width: 25px;
height: 25px;
}

.site-title {
font-size: 20px;
font-weight: bold;
color: rgb(30 41 59 );
font-family:'Lexend';
}

.header-padding {
width: 100%;
height: 140px;
background-color: rgb(30 41 59 );
margin-top: 1px;
margin-bottom: 100px;
display: flex;
padding: 5px 30px;
align-items: center;
text-align: center;
justify-content: center;
}

.header-padding-text {
font-size: 25px;
font-weight: bold;
color: white;
margin-top: 85px;
font-family: 'Lexend';
}

.paper5-logo {
width: 40px;
height: 40px;
margin-right: 7px;
margin-top: 70px;
}

.design-grid {
display: flex;
gap: 20px;
margin-top: 20px;
}

.design-option {
border: 1px solid #ccc;
padding: 10px;
cursor: pointer;
transition: all 0.3s;
}

.design-option img {
width: 100px;
height: 100px;
}

.design-option:hover {
border-color: #007bff;
transform: scale(1.05);
}
</style>
