<template>
  <div class="landing-container">
    <header class="landing-header">
      <img src="@/assets/paytaca.jpg" alt="Paytaca Logo" class="site-logo" />
      <h2 class="site-title">Paytaca.com</h2>
    </header>

    <div class="header-padding">
      <img src="@/assets/paper5.png" class="paper5-logo" />
      <h1 class="header-padding-text">Bitcoin Cash (BCH) Paper Wallet</h1>
    </div>

    <p class="wallet-description">Wallet Generated</p>

    <div class="wallet-container">

      <!-- Step One - Choose Your Design -->
      <div class="step-container">
        <div class="step-label1" @click="toggleDropdown">
          <img src="@/assets/dropdown.png" alt="dropdown" class="dropdown-image"/>
          <h1 class="step-text1">Step One - Choose Your Design</h1>
        </div>

        <div v-if="dropdownOpen" class="design-grid">
          <div v-for="design in designs" :key="design.id" class="design-preview">
            <img :src="design.image" :alt="'Design ' + design.id" class="design-image" />
            <div class="overlay"></div>
            <button class="select-button" @click="proceedToCustomization(design)">Select and Continue</button>
          </div>
        </div>
      </div>

      <!-- Step Two - Customization -->
      <div v-if="selectedDesign" class="step-container">
        <div class="step-label2" @click="toggleStep(2)">
          <img src="@/assets/dropdown.png" alt="dropdown" class="dropdown-image" />
          <h1 class="step-text2">Step Two - Customize</h1>
        </div>

        <div v-if="activeStep === 2" class="customization-section">
          <label class="custom">Custom BCH Amount: </label>
          <select v-model="paymentDetails" @change="updatePublicQRCode" class="dropdown">
        <option disabled value="">Amount</option>
        <option v-for="amount in [0.001,0.005,0.05, 0.1, 0.25, 0.5, 0.75, 1, 5, 10]" :key="amount" :value="amount">
          {{ amount }} BCH
        </option>
      </select>
          <label class="address">Addresses to generate:</label>
          <input class="input-bar" type="number" v-model="addressCount" />

          <!-- Paper Wallet Container -->
          <div v-if="customAmount && addressCount" class="paper-wallet-container">
            <h3>Paper Wallet Preview</h3>
            <div class="paper-wallet">
              <div class="paper-wallet-content">
                <div class="bch-amount">
                  <p>Amount: {{ customAmount }} BCH</p>
                </div>
                <div class="generated-addresses">
                  <p>Generated Addresses: {{ addressCount }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Design Image Display -->
          <div v-if="selectedDesign" class="selected-design-container" id="printable-wallet">
  <div class="selected-design">
    <div class="design-image-container">
      <img :src="selectedDesign.image" alt="Selected Design" class="design-image" />
      
      <!-- QR Code Overlay -->
      <div class="qr-code-overlay" 
           :class="{'white-theme': [2, 4, 7, 9].includes(selectedDesign?.id), 
                    'black-theme': [1, 3, 5, 6].includes(selectedDesign?.id)}">
        <!-- Private QR Code Section -->
        <div class="qr-section private-section">
          <img :src="qrCodeDataPrivate" alt="Private QR Code" class="qr-code private-qr" />
        </div>
        <p class="private-key">{{ privateKeyWIF }}</p>
        <!-- Public QR Code Section -->
        <div class="qr-section public-section">
          <img :src="qrCodeDataPublic" alt="Public QR Code" class="qr-code public-qr" />
        </div>
        <p class="wallet-address">{{ bitcoinCashAddress }}</p>
      </div>
    </div>
  </div>
</div>



        
    </div>
  </div>

      <!-- Step Three - Print -->
      <div v-if="selectedDesign" class="step-container">
        <div class="step-label3">
          <h1 class="step-text3"><button class = "print-btn" @click = "printWallet(3)">Print</button></h1>
        </div>
      </div>  

    </div>
  </div>
</template>


<script>
import { binToHex, hexToBin, ripemd160, binToBase58, decodeBase58Address, encodeCashAddress, secp256k1 } from "@bitauth/libauth";
import QRCode from "qrcode";
import { Buffer } from "buffer";
import html2canvas from "html2canvas";

export default {
  data() {
    return {
      paymentDetails: "",
      privateKeyWIF: "",
      publicKeyHex: "",
      bitcoinCashAddress: "",
      qrCodeDataPublic: "",
      qrCodeDataPrivate: "",
      privateKeyHash: "",
      publicKeyHash: "", 
      dropdownOpen: true,     
      activeStep: null,       
      selectedDesign: null,   
      customAmount: null,
      addressCount: null,
      designs: [
        { id: 1, image: "src/assets/paperwallet1.png" },
        { id: 2, image: "src/assets/paperwallet2.png" },
        { id: 3, image: "src/assets/paperwallet3.png" },
        { id: 4, image: "src/assets/paperwallet4.png" },
        { id: 5, image: "src/assets/paperwallet5.png" },
        { id: 7, image: "src/assets/paperwallet7.png" },
        { id: 6, image: "src/assets/paperwallet6.png" },
        { id: 9, image: "src/assets/paperwallet9.png" },
        
       
        
      ],
    };
  },

  async created() {
    await this.generateNewKeys();
  },

  methods: {
    async sha256(data = '', encoding = 'utf8') {
      let buffer;

      if (data instanceof Uint8Array) {
        buffer = data;
      } else if (encoding === 'utf8') {
        buffer = new TextEncoder().encode(data);
      } else if (encoding === 'hex') {
        buffer = hexToBin(data);
      } else {
        throw new Error('Unsupported encoding type');
      }

      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      return binToHex(new Uint8Array(hashBuffer));
    },

    async generateNewKeys() {
      const privateKey = await this.generatePrivateKey();
      this.privateKeyWIF = privateKey.wif;
      this.publicKeyHex = privateKey.publicKey;
      this.bitcoinCashAddress = privateKey.address;

      this.qrCodeDataPrivate = await QRCode.toDataURL(this.privateKeyWIF);
      this.updatePublicQRCode();
    },

    async generatePrivateKey() {
      // Generate a 32-byte private key
      const privateKeyBytes = new Uint8Array(32);
      crypto.getRandomValues(privateKeyBytes);

      // Convert private key to hex
      const privateKeyHex = binToHex(privateKeyBytes);
      const privateKeyHash = await this.sha256(privateKeyHex, 'hex'); // Hash private key

      // Generate public key
      const publicKeyBytes = secp256k1.derivePublicKeyCompressed(privateKeyBytes);
      const publicKeyHex = binToHex(publicKeyBytes);
      const publicKeyHash = await this.sha256(publicKeyHex, 'hex'); // Hash public key

      // Encode as Bitcoin Cash Address
      const sha256Hash = await this.sha256(publicKeyHex, 'hex');
      const ripemdHash = ripemd160.hash(hexToBin(sha256Hash));

      // Generate WIF Private Key
      const extendedKey = new Uint8Array([0x80, ...privateKeyBytes, 0x01]); // 0x01 for compressed
      const hashWif1 = await this.sha256(extendedKey, 'hex');
      const hashWif2 = await this.sha256(hexToBin(hashWif1), 'hex');
      const checksumWif = hexToBin(hashWif2).slice(0, 4);
      const wifKey = new Uint8Array([...extendedKey, ...checksumWif]);
      const finalWIF = binToBase58(wifKey);

      return {
        privateKey: privateKeyHex,
        privateKeyHash, // Store hashed private key
        publicKey: publicKeyHex,
        publicKeyHash, // Store hashed public key
        address: encodeCashAddress({
          prefix: 'bitcoincash',
          type: 'p2pkh',
          payload: ripemdHash,
        }).address,
        wif: finalWIF
      };
    },

    async updatePublicQRCode() {
      if (!this.bitcoinCashAddress) return;
      const amount = this.paymentDetails || 0;
      const qrDataPublic = `${this.bitcoinCashAddress}?amount=${amount}`;
      this.qrCodeDataPublic = await QRCode.toDataURL(qrDataPublic);
    },

    async printWallet() {
    const printable = document.getElementById("printable-wallet");

    if (!printable) {
      console.error("Printable wallet section not found!");
      return;
    }

    // Convert the element to a canvas image
    const canvas = await html2canvas(printable, { scale: 2 });
    const imageData = canvas.toDataURL("image/png");

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Wallet</title>
          <style>
            body { text-align: center; margin: 0; padding: 20px; }
            img { width: 100%; max-width: 1000px; }
          </style>
        </head>
        <body>
          <img src="${imageData}" alt="Printed Wallet">
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    },

    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
      if (!this.dropdownOpen) {
        this.selectedDesign = true;  // Automatically select design
        this.activeStep = 2;         // Open Step 2
      }
    },

    selectDesign(design) {
      this.selectedDesign = design;
      this.dropdownOpen = false; 
      this.activeStep = 2;           // Ensure Step 2 is active
    },

    toggleStep(step) {
      this.activeStep = this.activeStep === step ? null : step;
    },

    proceedToCustomization(design) {
      this.selectedDesign = design;    // Store the selected design
      this.dropdownOpen = false;        // Close Step 1 dropdown
      this.activeStep = 2;              // Automatically open Step 2
    },
  },
};
</script>


<style scoped>
.landing-container {
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: "Poppins", sans-serif;
  width: 100%;
}

.landing-header {
background-color: white;
width: 100%;
padding: 5px 30px;
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

.wallet-container {
  width: 60%;
  margin: 20px auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  background-color: #f9f9f9;
}

.step-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
}

.step-label1 {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: rgb(51 65 85);
  color: white;
  cursor: pointer;
}

.step-label2 {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #e05458;
  color: white;
  cursor: pointer;
}

.step-label3 {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: rgb(51 65 85);
  color: white;
  cursor: pointer;
}
.step-text1 {
  margin-left: 10px;
  font-size: 18px;
  font-weight: bold;
}

.step-text2 {
  margin-left: 10px;
  font-size: 18px;
  font-weight: bold;
}

.step-text3 {
  margin-left: 10px;
  font-size: 18px;
  font-weight: bold;
}

.dropdown {
  width: 90px;
}


.print.btn {
  position: absolute;
  bottom: 10px;
  background: #ff9800;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
}

.dropdown-image {
  width: 30px;
  height: 30px;
}


.customization-section, .print-section {
  padding: 20px;
  background-color: #fff;
}

.address {
font-weight: bold;
margin-right: -10px;
margin-left: 10px;
}

.input-bar {
  width: 40px;
  margin-right: -10px;
  margin-left: 16px;
}

.custom {
  font-weight: bold;
  margin-left: 60px;
}

.design-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Responsive grid */
  gap: 20px;
  justify-content: center;
  align-items: center;
  padding: 10px;
}


.design-preview {
  position: relative; /* Makes child elements position relative to this */
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.design-preview img {
  width: 100%;
  height: auto; /* Maintains aspect ratio */
  object-fit: contain; /* Prevents stretching */
  display: block;
}


.design-image {
  width: 100%;
  display: block;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.3s ease;
}


.design-preview:hover .overlay {
  opacity: 3;
}


.select-button {
  position: absolute;
  bottom: 10px;
  background: #ff9800;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease-in-out, transform 0.2s ease-in-out;
}


.design-preview:hover .select-button {
  opacity: 2;

}.selected-design-container {
  margin-bottom: 20px;
  margin-top: 20px;
  position: relative;
}

.selected-design .design-image-container {
  position: relative;
  display: inline-block;
}

.selected-design .design-image {
  width: 100%;
  height: auto;
}

.selected-design .qr-code-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px;
  color: white;
}

.selected-design .qr-section {
  position: relative;
  text-align: center;
}

.selected-design .public-section {
  position: absolute;
  display: flex;
  right: 89px; /* Position public QR code and address on the right */
  top: 75.5px;
}

.selected-design .private-section {
  position: absolute;
  display: flex;
  left: 12px;   /* Position private QR code and key on the left */
  top: 41.5px;
  margin-top: -14.3px;
}

.selected-design .qr-code {
  width: 100px; /* Adjust the size of the QR codes */
  height: 100px;
}

.wallet-address{
  font-size: 12px;
  font-weight: bold;
  margin-top: 20px;
  margin-right: 20px;
  margin-left: -30px;
}

.private-key {
  font-size: 10px;
  font-weight: bold;
  margin-top: 120px;
  margin-bottom: -90px;
  transform: rotate(-45.7deg);
  margin-left: -7%;
  margin-right: -10px;
}

/* Default Styling */
.qr-code-overlay {
  padding: 10px;
  
}

/* White Theme: White QR Code Background & White Text */
.white-theme .qr-code-overlay {
  background-color: white !important;
  color: white !important;
}

.white-theme .private-key,
.white-theme .wallet-address {
  color: white !important;
  font-weight: bold;
}

/* Black Theme: Dark QR Code Background & Black Text */
.black-theme .qr-code-overlay {
  background-color: black !important;
  color: black !important;
  font-weight:bold;
}

.black-theme .private-key,
.black-theme .wallet-address {
  color: black !important;
  font-weight: bold;
}




/* Responsive Styles */
@media (max-width: 480px) {
  .design-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Adjust columns for tablets */
  }

  .design-preview {
    max-width: 300px; /* Adjusts for smaller screens */
  }
}

@media (min-width: 1025px) {
  .design-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (max-width: 480px) {
  .design-grid {
    grid-template-columns: 1fr; /* Single column for mobile */
  }

  .select-button {
    font-size: 12px; /* Smaller button text */
    padding: 8px 16px;
  }
}

@media (prefers-color-scheme: dark) {
  .text-overlay {
    color: white;
  }
}
</style>
