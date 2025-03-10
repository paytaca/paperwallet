<template>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
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
          <img src="@/assets/dropdown.png" alt="dropdown" class="dropdown-image" />
          <h1 class="step-text">Step One - Choose Your Design</h1>
        </div>

        <div v-if="dropdownOpen" class="design-grid">
          <div v-for="design in designs" :key="design.id" class="design-preview">
            <img :src="design.image" :alt="'Design ' + design.id" class="design-image" />
            <div class="overlay"></div>
            <button class="select-button" @click="proceedToCustomization(design)">
              Select and Continue
            </button>
          </div>
        </div>
      </div>

      <!-- Step Two - Customization -->
      <div v-if="selectedDesign" class="step-container">
        <div class="step-label2" @click="toggleStep(2)">
          <img src="@/assets/dropdown.png" alt="dropdown" class="dropdown-image" />
          <h1 class="step-text">Step Two - Customize</h1>
        </div>

        <div v-if="activeStep === 2" class="customization-section">
          <label class="custom">Custom BCH Amount:</label>
          <select v-model="paymentDetails" @change="updatePublicQRCodes" class="dropdown">
            <option disabled value="">Amount</option>
            <option v-for="amount in [0.0001, 0.001, 0.005, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 5, 10]" 
                    :key="amount" 
                    :value="amount">
              {{ amount }} BCH
            </option>
          </select>

          <label class="address">Addresses to generate:</label>
          <input class="input-bar" type="number" v-model.number="addressCount" @input="generateMultipleKeys" />

          <!-- Paper Wallet Container -->
          <div v-if="customAmount && addressCount" class="paper-wallet-container">
            <div class="paper-wallet">
              <div class="paper-wallet-content">
                <div class="generated-addresses"></div>
              </div>
            </div>
          </div>

          <!-- Design Image Display -->
          <div v-if="generatedWallets.length" class="wallets-container"id="printable-wallet">
            <div v-for="(wallet, index) in generatedWallets" :key="index" class="selected-design-container">
              <h3 class = "wallet-padding" v-if="index > 0"></h3> 
              <div class="selected-design">
                <div class="design-image-container" :style="{ color: wallet.design.textColor }">
                  <img :src="wallet.design.image" alt="Selected Design" class="design-image" />

                  <div class="qr-code-overlay">
                    <div class="bch-amount">
                      <p>{{ wallet.customAmount }} BCH</p> <!-- Show the correct amount per wallet -->
                    </div>

                    <!-- Public Address QR -->
                    <div class="qr-section public-section">
                      <img :src="wallet.qrCodePublic" alt="Public QR Code" class="qr-code public-qr" />
                    </div>
                    <p class="wallet-address">{{ wallet.address }}</p>

                    <!-- Private Key QR -->
                    <div class="qr-section private-section">
                      <img :src="wallet.qrCodePrivate" alt="Private QR Code" class="qr-code private-qr" />
                    </div>
                    <p class="private-key">{{ wallet.wif }}</p>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      <!-- Step Three - Print -->
      <div v-if="selectedDesign" class="step-container">
        <div class="step-label3" @click="printWallet(3)">
          <img src="@/assets/dropdown.png" alt="dropdown" class="dropdown-image" />
          <h1 class="step-text">Step Three - Print</h1>
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
      addressCount: 1,
      generatedWallets: [],
      designs: [
        { id: 1, image: "src/assets/pw1.png", textColor: 'black' },
        { id: 2, image: "src/assets/pw2.png", textColor: 'white' },
        { id: 3, image: "src/assets/pw3.png", textColor: 'black' },
        { id: 4, image: "src/assets/pw4.png", textColor: 'white' },
        { id: 5, image: "src/assets/paperwallet5.png", textColor: 'white' },
        { id: 6, image: "src/assets/paperwallet6.png", textColor: 'white' },
        { id: 7, image: "src/assets/paperwallet7.png", textColor: 'white' },
        { id: 8, image: "src/assets/paperwallet8.png", textColor: 'white' },
      ],
    };
  },

  async created() {
    await this.generateNewKeys(); // Generate new keys upon component creation
  },

  methods: {
    // Computes SHA-256 hash for a given data input
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

    // Generates new private and public keys, WIF, and Bitcoin Cash address
    async generateNewKeys() {
      const privateKey = await this.generatePrivateKey();
      this.privateKeyWIF = privateKey.wif;
      this.publicKeyHex = privateKey.publicKey;
      this.bitcoinCashAddress = privateKey.address;

      this.qrCodeDataPrivate = await QRCode.toDataURL(this.privateKeyWIF);
      this.updatePublicQRCodes();
    },

    // Generates a private key, derives public key and Bitcoin Cash address
    async generatePrivateKey() {
      const privateKeyBytes = new Uint8Array(32);
      crypto.getRandomValues(privateKeyBytes);

      const privateKeyHex = binToHex(privateKeyBytes);
      const privateKeyHash = await this.sha256(privateKeyHex, 'hex');

      const publicKeyBytes = secp256k1.derivePublicKeyCompressed(privateKeyBytes);
      const publicKeyHex = binToHex(publicKeyBytes);
      const publicKeyHash = await this.sha256(publicKeyHex, 'hex');

      const sha256Hash = await this.sha256(publicKeyHex, 'hex');
      const ripemdHash = ripemd160.hash(hexToBin(sha256Hash));

      const extendedKey = new Uint8Array([0x80, ...privateKeyBytes, 0x01]);
      const hashWif1 = await this.sha256(extendedKey, 'hex');
      const hashWif2 = await this.sha256(hexToBin(hashWif1), 'hex');
      const checksumWif = hexToBin(hashWif2).slice(0, 4);
      const wifKey = new Uint8Array([...extendedKey, ...checksumWif]);
      const finalWIF = binToBase58(wifKey);

      return {
        privateKey: privateKeyHex,
        privateKeyHash,
        publicKey: publicKeyHex,
        publicKeyHash,
        address: encodeCashAddress({
          prefix: 'bitcoincash',
          type: 'p2pkh',
          payload: ripemdHash,
        }).address,
        wif: finalWIF
      };
    },

    // Generates multiple Bitcoin Cash addresses based on user input
    async generateMultipleKeys() {
    const MAX_WALLETS = 10; // Set your desired wallet limit

    // Ensure addressCount starts at 1
    if (!this.addressCount || this.addressCount < 1) {
        this.addressCount = 0;
    }

    // If no design is selected, prevent wallet generation
    if (!this.selectedDesign) {
        return;
    }

    this.customAmount = this.paymentDetails ? parseFloat(this.paymentDetails) : 0;

    // If no wallets exist, create the first static wallet
    if (this.generatedWallets.length === 0) {

        const firstWallet = await this.generatePrivateKey();
        if (!firstWallet || !firstWallet.address || !firstWallet.wif) {
            return;
        }

        try {
            firstWallet.qrCodePublic = await QRCode.toDataURL(`${firstWallet.address}?amount=${this.customAmount}`);
            firstWallet.qrCodePrivate = await QRCode.toDataURL(firstWallet.wif);
        } catch (error) {
            console.error("QR Code generation failed for static wallet:", error);
        }

        firstWallet.customAmount = this.customAmount;
        firstWallet.design = { ...this.selectedDesign };
        this.generatedWallets.push(firstWallet);
    }

    // Ensure address count does not exceed MAX_WALLETS
    this.addressCount = Math.min(Math.max(this.addressCount, 0), MAX_WALLETS);

    // Remove excess wallets while keeping the first one static
    if (this.generatedWallets.length > this.addressCount) {
          // Keep the first wallet, remove others
        this.generatedWallets = [this.generatedWallets[0], ...this.generatedWallets.slice(1, this.addressCount)];
    }

    // Generate additional wallets (excluding the static one)
    while (this.generatedWallets.length < this.addressCount) {
        if (this.generatedWallets.length >= MAX_WALLETS) {
            console.warn(`Wallet generation limit reached! Max allowed: ${MAX_WALLETS}`);
            break;
        }

        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay

        const wallet = await this.generatePrivateKey();
        if (!wallet || !wallet.address || !wallet.wif) {
            console.error(`Wallet #${this.generatedWallets.length + 1} generation failed!`);
            continue;
        }

        try {
            wallet.qrCodePublic = await QRCode.toDataURL(`${wallet.address}?amount=${this.customAmount}`);
            wallet.qrCodePrivate = await QRCode.toDataURL(wallet.wif);
        } catch (error) {
            console.error(`QR Code generation failed for wallet #${this.generatedWallets.length + 1}:`, error);
        }

        wallet.customAmount = this.customAmount;
        wallet.design = { ...this.selectedDesign };

        this.generatedWallets.push(wallet);
    }
},

    // Updates the public QR code with a payment amount
    async updatePublicQRCodes() {
  if (!this.generatedWallets.length) {
    console.error("No generated wallets found!");
    return;
  }

  const amount = this.paymentDetails ? parseFloat(this.paymentDetails) : 0;

  for (const wallet of this.generatedWallets) {
    wallet.customAmount = amount; // Assign amount to each wallet

    // Ensure we don't duplicate "bitcoincash:" in the address
    const cleanAddress = wallet.address.replace(/^bitcoincash:/, '');

    // Construct QR code data with the specified amount
    let qrDataPublic = `bitcoincash:${cleanAddress}`;
    if (amount > 0) {
      qrDataPublic += `?amount=${amount}`;
    }

    try {
      wallet.qrCodePublic = await QRCode.toDataURL(qrDataPublic, {
        errorCorrectionLevel: 'L',
      });
      console.log(`QR Code updated for ${cleanAddress}:`, wallet.qrCodePublic);
    } catch (error) {
      console.error(`Error generating QR code for ${cleanAddress}:`, error);
    }
  }
},
generateQRCode(address, amount) {
    return `https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=bitcoincash:${address}?amount=${amount}`;
  },
    // Converts the wallet section into an image and opens a print window
    async printWallet() { 
      const printable = document.getElementById("printable-wallet");
      if (!printable) {
        console.error("Printable wallet section not found!");
        return;
      }
      const canvas = await html2canvas(printable, { scale: 2 });
      const imageData = canvas.toDataURL("image/png");
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Wallet</title>
            <style>body { text-align: center; margin: 0; padding: 20px; } img { height: 100% width: 100%; max-width: 1000px; }</style>
          </head>
          <body><img src="${imageData}" alt="Printed Wallet"></body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    },

    // Toggles dropdown for design selection
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
      if (!this.dropdownOpen) {
        this.selectedDesign = true;
        this.activeStep = 2;
      }
    },

    // Sets the selected design and updates UI state
    selectDesign(design) {
      this.selectedDesign = design;
      this.dropdownOpen = false;
      this.activeStep = 2;
    },

    // Toggles step visibility in UI
    toggleStep(step) {
      this.activeStep = this.activeStep === step ? null : step;
    },

    // Moves to customization step after design selection
    proceedToCustomization(design) {
      this.selectedDesign = design;
      this.generatedWallets.forEach(wallet => {
      wallet.design = { ...design };
      }); 
      this.dropdownOpen = false;
      this.activeStep = 2;
      this.addressCount = 1; 
      this.generateMultipleKeys();
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
.step-text {
  margin-left: 10px;
  font-size: 18px;
  font-weight: bold;
}

.dropdown-image {
  width: 30px;
  height: 30px;
}

.custom{
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-right: 5px;
}

.address {
  font-weight: bold;
  margin-left: 20px;
}

.input-bar {
  width: 30px;
  margin-left: 10px;
}

.amount {
  width: 10px;
}


.customization-section {
  padding: 20px;
  background-color: #fff;
}

.design-grid {
  display: grid;
  margin-left: 50px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Responsive grid */
  gap: 15px;
  justify-content: center;
  align-items: center;
  padding: 15px;
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
  font-style: 'Lexend';
  font-size: 20px;
  position: absolute;
  bottom: 90px;
  background: #ff9800;
  color: white;
  border: none;
  padding: 20px 15px;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease-in-out, transform 0.2s ease-in-out;
}


.design-preview:hover .select-button {
  opacity: 2;
}.selected-design-container {
  position: relative;
  position: relative;
  width: 100%;	 
  height: 100%; 
  overflow: hidden;
}

.selected-design .design-image-container {
  position: relative;
  display: inline-block;
  padding-top: 15px;
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
}

.selected-design .qr-section {
  position: relative;
  text-align: center;
}

.selected-design .public-section {
  position: absolute;
  display: flex;
  right: 89.9px;
  top: 90px;

}

.selected-design .private-section {
  position: absolute;
  display: flex;
  left: 10.2px; 
  top: 42px;
}

.selected-design .qr-code {
  width: 101.9px; 
  height: 101px;
}

.wallet-address{
  position: absolute;
  font-size: 0.9rem;
  top: 3%; 
  left: 71%; 
  transform: translateX(-50%);
  white-space: nowrap;
  max-width: 90%
}

.private-key {
  position: absolute;
  font-size: 0.7rem;
  top: 17vh; 
  left: 18%;
  transform: translateX(-53%) translateY(100%) rotate(-45.7deg); /* Centers horizontally */
  white-space: nowrap;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
}


.bch-amount {
  display: flex;
  justify-content: center;
  align-items: center; 
  text-align: center;
  font-size: 25px; 
  font-weight: bold;
  color: #DAA425;
  padding: 29%; 
  background-color: transparent;
  border-radius: 5px;
  margin: 30px auto;
  width: fit-content; 
  margin-left: 130px;
  margin-right: -50px;
  margin-top: -10px;
  margin-bottom: 10px;
}

.wallet-padding {
  margin-top: -15px;
  padding-top: -80px;
  padding: -40px;
  padding-bottom: -50px;
}


/* Responsive Styles */
@media (max-width: 1440px) {
  .design-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .design-preview {
    max-width: 300px;
  }
}

@media (max-width: 424px) {
  .landing-header {
    padding: 1px 30px;
  }

  .header-padding-text {
    font-size: 14px;
  }
}

@media (max-width: 1440px) {
  .design-grid {
    grid-template-columns: 1fr;
  }

  .select-button {
    font-size: 12px;
    padding: 8px 16px;
  }

  .wallet-description {
    font-size: 18px;
    margin-top: -40px;
  }

  .wallet-container {
    width: 100%;
    padding: 10px;
  }

  .step-text {
    font-size: 16px;
  }

  .select-button {
    font-size: 10px;
    padding: 6px 12px;
  }
}

/* Small devices (phones, 425px - 767px) */
@media (max-width: 767px) {
  .landing-header {
    padding: 10px 20px;
  }
  .selected-design .qr-code {
  width: 30px; /* Adjust the size of the QR codes */
  height: 30px;
  }
  .selected-design .public-section {
  position: absolute;
  display: flex;
  right: 57px; /* Position public QR code and address on the right */
  top: 30px;
  }

  .selected-design .private-section {
    position: absolute;
    display: flex;
    left: 18.9px;   /* Position private QR code and key on the left */
    top: 41.5px;
  }
  .wallet-address{
  position: absolute;
  font-size: 20px;
  top: 3%; /* Adjust this value to keep it fixed */
  left: 67.9%; /* Center the text */
  transform: translateX(-50%); /* Ensures centering */
  white-space: nowrap;
  }

  .private-key {
  position: absolute;
  font-size: clamp(9px, 1.2vw, 12px); /* Responsive text size */
  top: 30.5%; /* Keeps it in the same relative position */
  left: 50%; /* Centers it relative to the wallet */
  transform: translateX(-50%) rotate(-45.7deg); /* Keeps it locked in place */
  white-space: nowrap;
}
  
  .bch-amount {
    display: flex;
    justify-content: center;
    align-items: center; 
    text-align: center;
    font-size: 40px; 
    font-weight: bold;
    color: #10b01b;
    padding: 29%; 
    background-color: transparent;
    border-radius: 5px;
    margin: 30px auto;
    width: fit-content; 
    margin-left: -13.5%;
    margin-top: -10.5%;
    transform: rotate(-45.7deg);
  }

  .wallet-description {
    font-size: 20px;
    margin-top: -60px;
  }

  .wallet-container {
    width: 80%;
    padding: 15px;
  }

  .design-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); /* Smaller grid for small screens */
  }

  .select-button {
    font-size: 12px;
    padding: 8px 14px;
  }
}

/* Medium devices (tablets, 768px - 1023px) */
@media (max-width: 1023px) {
  .landing-header {
    padding: 15px 30px;
  }

  .wallet-container {
    width: 70%;
  }

  .design-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Adjusted for tablets */
  }
}

/* Large devices (desktops, 1024px and up) */
@media (min-width: 1024px) {
  .wallet-container {
    width: 60%;
  }

  .design-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* More spacious layout */
  }
}


@media (max-width: 1440px) {
  .selected-design .public-section {
    right: 11.6%; 
    top: 15.4%;
  }

  .selected-design .private-section {
    left: 1.2%;
    top: 40.6px;
  }

  .selected-design .qr-code {
    width: min(14vw, 100px); 
    height: min(14vw, 100px);
  }
}


@media (max-width: 768px) {
  .selected-design .public-section,
  .selected-design .private-section {
    position: static;
    text-align: center;
    margin-bottom: 20px;
  }

  .selected-design .qr-code {
    width: min(40vw, 90px);
    height: min(40vw, 90px);
  }
}

@media print {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .wallet-container {
    display: block; /* Ensures correct layout */
    width: 100%;
  }

  .paper-wallet {
    page-break-before: always; /* Forces new page for each wallet */
  }

  .paper-wallet:first-child {
    page-break-before: auto !important; /* Prevents skipping the first page */
  }
}

</style>