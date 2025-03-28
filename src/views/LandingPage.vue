<template>
  <div class="landing-container">
    <header class="landing-header">
      <img src="@/assets/paytaca.jpg" alt="Paytaca Logo" class="site-logo">
      <a href="https://www.paytaca.com/#home" target="_blank" class="site-title">Paytaca.com</a>

      <!--Dark Mode Toggle Button-->
    <button class = "toggle-button" @click = "toggleDarkMode">
      <span v-if = "isDarkMode">🌙</span>
      <span v-else>🌞</span>
    </button>

    </header>



    <div class="header-padding">
      <img src="@/assets/paper5.png" class="paper5-logo">
      <h1 class="header-padding-text">Bitcoin Cash (BCH) Paper Wallet</h1>
    </div>

    <p class="wallet-description">Move your mouse to generate Bitcoin Cash (BCH) Address</p>

    <div class="hash-generator">
      <!-- Progress Container -->
      <div class="progress-container">
        <p>Generating Bitcoin (BCH) Address</p>

        <!-- Progress Bar with percentage -->
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: progress + '%' }">
            <span class="progress-text">{{ progress.toFixed(1) }}%</span>
          </div>
        </div>
        
        <!-- Manual input area -->
        <input class="input-bar" v-model="manualEntropy" @input="updateEntropy" placeholder="no mouse? enter random text here">
      </div>
    </div>

    <!-- 🆕 Jumbled text that moves dynamically -->
    <p class="jumbled-text" :style="{ transform: `translate(${offsetX}px, ${offsetY}px)` }">
      {{ jumbledText }}
    </p>

  </div>
</template>

<script>
import { Buffer } from 'buffer';
import CryptoJS from "crypto-js";
import QRCode from "qrcode";
import { ec as EC } from "elliptic";
import bs58 from "bs58";
import { encode as cashaddrEncode } from "cashaddrjs";
import axios from 'axios';

export default {
  name: "BCHAddressGenerator",
  data() {
    return {
      entropy: "",   
      manualEntropy: "",
      progress: 0,
      generatedAddress: "",
      addressGenerated: false,
      qrCodeData: "",
      jumbledText: this.generateJumbledText(),
      offsetX: 0,
      offsetY: 0,
      isLightMode: localStorage.getItem("lightMode") === "true" || localStorage.getItem("lightMode"),
      isDarkMode: localStorage.getItem("darkMode") === "true" && localStorage.getItem("lightMode") !== "true"
    };
  },

  async created() {
    document.body.classList.toggle("dark-mode", this.isdarkMode);
    document.body.classList.toggle("light-mode", this.islightMode);
  },


  mounted() {
    window.addEventListener("mousemove", this.captureEntropy);
  },
  beforeDestroy() {
    window.removeEventListener("mousemove", this.captureEntropy);
  },


  methods: {
    //Dark Mode Toggle

    toggleDarkMode() {
      this.isLightMode = !this.isLightMode;
      this.isDarkMode = !this.isDarkMode;

      localStorage.setItem("lightMode", this.isLightMode);
      localStorage.setItem("darkMode", this.isDarkMode);

      document.body.classList.remove("light-mode", "dark-mode");
      if (this.isDarkMode) {
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
      }else{
        document.body.classList.add("light-mode");
        document.body.classList.remove("dark-mode");
      }
    },


    captureEntropy(event) {
      if (this.addressGenerated || this.progress >= 100) return;
      this.entropy += `${event.clientX},${event.clientY}|`;
      this.progress += 0.1;
      if (this.progress >= 100) {
        this.progress = 100;
        this.generateAddress();
      }
      this.jumbledText = this.generateJumbledText();
      this.offsetX = Math.random() * 10 - 5;
      this.offsetY = Math.random() * 10 - 5;
    },

    updateEntropy() {
      if (this.addressGenerated || this.progress >= 100) return;
      this.entropy += this.manualEntropy;
      this.progress += 0.1;
      if (this.progress >= 100) {
        this.progress = 100;
        this.generateAddress();
      }
    },

    async generateAddress() {
      const { privateKey, publicKey, legacyAddress, cashAddress } =
        await this.generatePrivateKeyFromEntropy(this.entropy);
      this.generatedAddress = cashAddress; // Use the BCH CashAddr format
      this.addressGenerated = true;
      this.qrCodeData = await QRCode.toDataURL(this.generatedAddress); 
      console.log(this.generatedAddress); // Log the generated address
      this.redirectToWalletGenerator();
    },
    
    async generatePrivateKeyFromEntropy(entropy) {
      const ec = new EC("secp256k1");

      // Generate private key from entropy
      const hash = CryptoJS.SHA256(entropy).toString();
      const keyPair = ec.keyFromPrivate(hash, "hex");
      const privateKeyHex = keyPair.getPrivate("hex");
      const publicKeyHex = keyPair.getPublic(true, "hex"); // Compressed public key

      // Hash the public key (SHA-256 → RIPEMD-160)
      const sha256Hash = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(publicKeyHex)).toString();
      const ripemd160Hash = CryptoJS.RIPEMD160(CryptoJS.enc.Hex.parse(sha256Hash)).toString();

      // Construct Legacy Address (Base58Check)
      const versionByte = "00"; // Mainnet P2PKH prefix
      const payload = versionByte + ripemd160Hash;

      // Compute checksum (Double SHA-256)
      const checksum = CryptoJS.SHA256(CryptoJS.SHA256(CryptoJS.enc.Hex.parse(payload)))
        .toString()
        .substring(0, 8);

      const finalAddressHex = payload + checksum;
      const legacyAddress = bs58.encode(Buffer.from(finalAddressHex, "hex"));

      // Convert to Bitcoin Cash Address format (CashAddr)
      const cashAddress = cashaddrEncode("bitcoincash", "P2PKH", Buffer.from(ripemd160Hash, "hex"));

      return {
        privateKey: privateKeyHex,
        publicKey: publicKeyHex,
        legacyAddress,
        cashAddress
      };
    },

    redirectToWalletGenerator() {
      this.$router.push("/walletgenerator");
    },

    generateJumbledText() {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      return Array.from({ length: 40 })
        .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
        .join("");
    }
  }
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap');


/*Dark Mode*/ 
.dark-mode .landing-container,
.dark-mode .landing-header {
  background-color: rgb(30 41 59 );
}

.dark-mode .hash-generator {
  background-color: #E2E8F0;
}

.dark-mode .header-padding {
  background-color: rgb(239, 246, 255);
}

/*Darkmode Text*/
.dark-mode .site-title,
.dark-mode .jumbled-text,
.dark-mode .wallet-description {
  color: rgb(239, 246, 255);
}

.dark-mode .header-padding-text {
  color: rgb(30 41 59 );
}

/*LightMode*/
.light-mode .landing-container,
.light-mode .landing-header {
  background-color: rgb(239, 246, 255);
}

.light-mode .header-padding {
  background-color: rgb(30 41 59);
}


/*LightMode Text*/
.light-mode .header-padding-text {
  color: rgb(239, 246, 255);
}

.light-mode .site-title,
.light-mode .jumbled-text,
.light-mode .wallet-description {
  color: rgb(30 41 59 );
}



.toggle-button {
  position: fixed;
  top: 6px;
  right: 35px;
  width: 40px;
  height: 40px;
  background: white;
  color: black;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  transition: background 0.3s ease, transform 0.2s;
}

.toggle-button:hover {
  transform: scale(1.1);
}

.dark-mode .toggle-button {
  background: #121212;
  color: white;
}

.light-mode .toggle-button {
  background: #EEDC82;
  color: #333;
}



.lexend {
  font-family: "Lexend", serif;
  font-optical-sizing: auto;
  font-weight: bold;
  font-style: normal;
}

.landing-container {
  background-color: #E2E8F0;
  position: fixed;
  background-size: cover;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  min-width: 100vw;
  font-family: "Poppins", sans-serif;
}

.landing-header {
  background-color: #E2E8F0;
  width: 100vw;
  padding: 15px 30px;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center; 
  gap: 10px; 
  z-index: 1000;
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
  margin-top: 70px;
  font-family: 'Lexend';
}

.site-logo {
  width: 25px;
  height: 25px;
}

.paper5-logo {
  width: 50px;
  height: 50px;
  margin-right:5px;
  margin-top: 50px;
}

.site-title {
  font-size: 20px;
  font-weight: bold;
  color: rgb(30 41 59 );
  font-family:'Lexend';
  text-decoration: none;
}

.wallet-description {
  text-align: center;
  font-size: 25px;
  font-weight: bold;
  color: rgb(51 65 85);
  margin-top: -80px;
  margin-bottom: 20px;
  font-family: 'Lexend';
}

.progress-container {
  text-align: center;
  margin-top: 20px;
  color: rgb(51 65 85);
  font-weight: bold;
  font-size: 20px;
  font-family: 'Lexend';
  
}

.progress-bar-container {
  width: 100%;
  height: 40px;
  background: #ccc;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  font-size: 20px;
  width: 100%;
  border-left-width: 300%;
}

.progress-bar {
  height: 100%;
  background: rgb(51 65 85);
  transition: width 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  position: center;
  size: 20px;
}

.progress-text {
  color: white;
  font-weight: bold;
  font-size: 18px;
  position: absolute;
  font-family: 'Lexend';
}

.input-bar {
  width: 85%;
  height: 40px;
  border: 2px solid #ccc;
  border-radius: 5px;
  margin-top: 10px;
  padding: 0 10px;
  font-size: 20px;
}

.hash-generator {
  width: 400px; 
  background-color: white; 
  padding: 20px; 
  border-radius: 10px; 
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); 
  text-align: center; 
  margin: 30px auto 0; 
  position: relative; 
}

.jumbled-text {
  font-size: 20px;
  font-weight: bold;
  color: rgb(30 41 59 );
  text-align: center;
  margin-top: 15px;
  transition: transform 0.1s ease-in-out;
  font-family: 'Lexend';
}

</style>
