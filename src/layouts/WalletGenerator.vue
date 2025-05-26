  <template>
    <head>
    <meta   name="viewport" 
            content="width=device-width, initial-scale=1.0">
    </head>
    <div    :class="{ 'dark-mode': isDarkMode }" 
            class="landing-container">
    <header class="landing-header">
    <q-card-section 
            class="landing-header" 
            style = "height: clamp(20px, 11vh, 70px);">
    <img    src="../assets/paytaca.jpg" 
            alt="Paytaca Logo" 
            class="site-logo" />
    <a      href="https://www.paytaca.com/#home" 
            target="_blank" 
            class="site-title" 
            style = "font-size: clamp(17px, 2vw, 20px);">
            Paytaca
    </a>

    
    <button class="toggle-button" @click="toggleDarkMode" 
            style = "z-index: 1000; position: sticky; margin-left: auto;">
    <span   v-if="isDarkMode">🌙 </span>
    <span   v-else>🌞 </span>
    </button>
    </q-card-section>
    </header>

    <q-card-section class="header-padding" 
                    style = "margin: 70px; height: 100px;">
    <img  src="../assets/paper5.png" 
          class="paper5-logo" 
          style = "width: clamp(30.1px, 5vw, 60px); height: auto; margin-bottom: 9px;"/>
    <h1   class="header-padding-text" 
          style="text-align: center; bottom: 1px; font-size: clamp(16px, 3vw, 30px); margin-top: 50px; 
                  padding: 9px; padding-bottom: 35px;">  
          Bitcoin Cash (BCH) Paper Wallet
    </h1>
    </q-card-section>

    <p    class="wallet-description">
          Wallet Generated
    </p>
    <div  class="wallet-container">

    <!-- Step One - Choose Your Design -->
    <div  class="step-container">
    <div  class="step-label1" @click="toggleDropdown">
    <img  src="../assets/dropdown.png" 
          alt="dropdown" 
          class="dropdown-image" />
    <h1   class="step-text">
          Step One - Choose Your Design
    </h1>
    </div>
    <div    v-if="dropdownOpen" 
            class="design-grid">
    <div    v-for="design in designs" 
            :key="design.id" 
            class="design-preview"
            style="position: relative; overflow: hidden; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    transition: transform 0.2s ease; grid-template-columns: repeat(2, 1fr); margin-top: 10%;">
    <img    :src="design.image"   
            :alt="'Design ' + design.id" 
            class="design-image" 
            style="width: 100%; height: auto; display: block;"/>
    <div    class="overlay" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.3);">
    </div>
    <button class="select-button" @click="proceedToCustomization(design)"
            style="position: absolute; bottom: 51%; left: 50%; transform: translateX(-50%); padding: 0.5rem 1rem;
                    border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; z-index: 2;">
            Select and Continue
    </button>
    </div>
    </div>
    </div>

    <!-- Step Two - Customization -->
    <div    v-if="selectedDesign" 
            class="step-container">
    <div    class="step-label2" @click="toggleStep(2)">
    <img    src="../assets/dropdown.png" 
            alt="dropdown" 
            class="dropdown-image" />
    <h1     class="step-text">
            Step Two - Customize
    </h1>
    </div>
    <div    v-if="activeStep === 2" 
            class="customization-section">
            <label class="custom">
  Custom {{ selectedAsset === 'Token' ? 'Token' : 'BCH' }} Amount:
</label>
<select v-model="paymentDetails" @change="updatePublicQRCodes"
        class="dropdown"
        :disabled="individualWalletOption">
  <option value="">
    Any Amount
  </option>
  <option v-for="amount in customAmountOptions"
          :key="amount"
          :value="amount">
    {{ amount }} {{ selectedAsset === 'Token' ? 'Tokens' : 'BCH' }}
  </option>
</select>

    <label  class="address">
            Addresses to generate:
    </label>      
    <div    class="loader-wrapper">
    <div    v-if="loading" 
            class="spinner">
    </div>
    <input  class="input-bar" 
            type="text" 
            v-model.number="addressCount" @keyup.enter="generateMultipleKeys" />
    <button class="encryption" @click="toggleAdvanceSettingdropdown">
            {{ showAdvanceSettingdropdown ? 'Hide Advanced Settings' : 'Advance Settings' }}
    </button>
    </div>
    <div    style="display: flex; align-items: center; gap: 0.6rem;">
    <label  class="token-option"> 
            Assets:
    </label>  
    <select class="token-dropdown" 
            v-model="selectedAsset" @change="handleAssetChange">
    <option value="Bitcoin Cash">
            Bitcoin Cash
    </option>
    <option value="Token">
            CashToken
    </option>
    </select>

    
    <select class="token-select"
            v-show="selectedAsset === 'Token'"
            style="margin-left: 10px;"
            v-model="selectedToken">
    <option value="" disabled selected>
            Select a Token
    </option>
    <option v-for="token in tokens"
            :key="token.tokenId"
            :value="token.symbol">
            {{ token.name }} ({{ token.symbol }})
    </option>
    </select>


    <label  class="individual-custom-amount" 
            style="display: flex; align-items: center;">
    <input  type="checkbox" 
            v-model="individualWalletOption" 
            style="margin-right: 0.1rem;" />
            Enable Individual Custom Amount
    </label>
    </div>
    <div    class="dropdown-wrapper">
    <div    v-if="showAdvanceSettingdropdown" 
            class="dropdown-panel" 
            style = "padding: 1rem;">
    <p      style = "font-size: 0.8rem; line-height: 1.5;">
    <strong>
            Check the BIP38 option, enter a passphrase, and click "Generate" to create an encrypted wallet
    </strong>
    </p>

    
    <div    class="advanced-settings-row" 
            style = "display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; font-size: 0.95rem;">

    
    <input  type="checkbox" 
            v-model="encryptOption" 
            id="bip38" />

    
    <label  for="bip38">
            BIP38 Encrypt?
    <span   class = "tooltip-container" 
            style = "position: relative;">
    <a      class="what-is-this" 
            href="#" 
            style = "margin-left: 4px;">(What's this?)
    </a>
    <span   class="tooltip-text">
            Selecting this option allows you to encrypt your wallet with a password you choose.
            You will not be able to spend from the wallet without this password. The benefit is
            additional security, but be careful — there is no way to recover your password if you forget it!
    </span>
    </span>
    </label>

    <!-- Passphrase -->
    <label  for="passphrase" 
            class="passphrase-label" 
            style="display: block;">Passphrase:
    </label>
    <input  id="passphrase" 
            type="text" 
            v-model="passphrase" 
            class="passphrase-input" 
            style="width: 40%; padding: 0.2rem; font-size: 0.9rem; border: 1px solid #ccc; border-radius: 5px;"/>

    <!-- Generate Button -->
    <button v-if="encryptOption" @click="generateMultipleKeys()" 
            class="generate-btn">
            Generate
    </button>
    </div>
    </div>
    </div>

    
    <div    v-if="customAmount && addressCount" 
            class="paper-wallet-container">
    <div    class="paper-wallet">
    <div    class="paper-wallet-content">
    <div    class="generated-addresses">
    </div>
    </div>
    </div>
    </div>

    <!-- Design Image Display -->
    <div    v-if="generatedWallets.length" 
            class="wallets-container" 
            id="printable-wallet">
    <div    v-for="(wallet, index) in generatedWallets" :key="index" 
            class="wallet">
    <div    v-if = "individualWalletOption" 
            class="individual-wallet-section">
    <label  class = "custom">
            Custom 
            {{ selectedAsset === 'Token' ? 'Token' : 'BCH' }} Amount:
    </label>
    <select v-model.number="wallet.customAmount" @change="updateQrCodeForWallet(wallet)" 
            class="wallet-amount-input">
    <option value="">
            Any Amount
    </option>
    <option v-for="amount in availableAmounts" 
            :key="amount" 
            :value="amount">
            {{ amount }} {{ selectedAsset === 'Token' ? selectedToken || 'Token' : 'BCH' }}
    </option>
    </select>
    </div>
    <h3     class = "wallet-padding" 
            v-if="index > 0">
    </h3>
    <div    class="selected-design">
    <div    class="design-image-container" 
            :style="{ color: wallet.design.textColor }">
    <img    :src="wallet.design.image" 
            alt="Selected Design" 
            class="design-image" />

    <div    class = "qr-code-overlay">
    <q-card-section class="bch-amount"
  style="top: 20%; left: 12.4%; transform: translateX(-50%) rotate(-180deg); 
         font-size: 1.2vw; text-align: center; pointer-events: none; 
         white-space: nowrap; text-overflow: ellipsis;">
  
  <div v-if="wallet.customAmount && wallet.customAmount > 0">
    <div>{{ wallet.customAmount }}</div>
    <div>{{ selectedAsset === 'Token' ? selectedToken : 'BCH' }}</div>
  </div>

    </q-card-section>              
    <q-card-section v-if="bip38Enabled"
                    class="bip38-label"
                    style="position: absolute; top: 68.5%; left: 28.5%; height: 4%; 
                            font-size: clamp(1px, 0.5vw, 24px); border: 1px solid #E2E8F0; 
                            border-radius: 5px; padding: 0.7em 0.5em; text-align: center;
                            pointer-events: none; white-space: nowrap; background-color: #E2E8F0; 
                            color: rgb(51, 65, 85);;">
    <p>      BIP38 ENCRYPTED  
    </p>
    </q-card-section>

    <!-- Public Address QR -->
    <q-card-section class="qr-section public-section"
                    style="position: absolute; top: 13%; right: 5.3%; width: 18%; height: auto; 
                            pointer-events: none; gap: 10px;">
    <img    :src="wallet.qrCodePublic"
            alt="Public QR Code"
            class="qr-code public-qr"
            style="width: clamp(21px, 7vw, 205px); height: auto;"/>

    <!-- Token logo on the left -->
    <img    v-if="selectedAsset === 'Token' && selectedTokenObject"
            :src="selectedTokenObject.image_url || 'default.png'" 
            alt="Token Logo" 
            style="position: absolute;top: 50%; left: -20%; transform: translate(-50%, -50%); 
                    width: 60px; height: 60px; border-radius: 50%; z-index: 10;"/>
    </q-card-section>
    <q-card-section class="wallet-address"
                    style="position: absolute; top: 2%; left: 57%; width: 25%; font-size: clamp(1px, 0.9vw, 20px); 
                            text-align: center; white-space: nowrap; pointer-events: none;">
    <p      :style="{color: selectedDesign?.addressColor || 'inherit'}">
            {{ wallet.address }}</p>
    </q-card-section>


    <!-- Private Key QR -->
    <q-card-section class="qr-section private-section"
                    style="position: absolute; top: 3.8%; left: 0.2%; width: 18%; height: auto;
                            pointer-events: none;">
    <img    :src="wallet.qrCodePrivate"
            alt="Private QR Code"
            class="qr-code private-qr"
            style="width: clamp(21px, 7vw, 205px); height: auto;"/>
    </q-card-section>
    <q-card-section class="private-key"
                    style="position: absolute; transform: translateX(-53%) translateY(-8%) rotate(-45.7deg);
                            bottom: 80%; left: 16%; top: 25%; width: 50%; font-size: min(max(2px, 0.6vw), 20px);
                            text-align: center; pointer-events: none; white-space: nowrap; overflow: visible;
                            text-overflow: ellipsis;">
    <p      :style="{color: selectedDesign?.textColor || 'inherit', fontWeight: 'bold'}">
            {{ wallet.encryptedWIF ? wallet.encryptedWIF : wallet.wif }}</p>
    </q-card-section>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>

    <!-- Step Three - Print -->
    <div   v-if="selectedDesign" 
          class="step-container">
    <div  class="step-label3" @click="printWallet(3)">
    <img  src="../assets/dropdown.png" 
          alt="dropdown" 
          class="dropdown-image" />
    <h1   class="step-text">
          Step Three - Print
    </h1>
    </div>
    </div>
    </div>
    </div>
</template>

<script>
    import CryptoJS from 'crypto-js';
    import QRCode from "qrcode";
    import { Buffer } from 'buffer/';
    import secp256k1 from 'secp256k1';
    import bs58 from "bs58";
    import cashaddr from "cashaddrjs";
    import html2canvas from 'html2canvas';
    import bip38 from '@asoltys/bip38'
    import pw1 from 'src/assets/pw1.png';
    import pw2 from 'src/assets/pw2.png';
    import pw3 from 'src/assets/pw3.png';
    import pw4 from 'src/assets/pw4.png';
    import pw5 from 'src/assets/pw5.png';
    import pw6 from 'src/assets/pw6.png';
    import pw7 from 'src/assets/pw7.png';
    import pw8 from 'src/assets/pw8.png';
    import pw9 from 'src/assets/pw9.png';
    import pw10 from 'src/assets/pw10.png';

export default {
  data() {
    return {
      paymentDetails: "",
      privateKeyWIF: "",
      publicKeyHex: "",
      encryptedWIF: "",
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
      isLightMode: localStorage.getItem("lightMode") === "true" || localStorage.getItem("lightMode"),
      isDarkMode: localStorage.getItem("darkMode") === "true" && localStorage.getItem("darkMode") !== "true",
      loading: false,
      showAdvanceSettingdropdown: false,
      encryptOption: false,
      passphrase: '',
      individualWalletOption: false,
      wallet: {customAmount: ""},
      selectedAsset: 'Bitcoin Cash',
      selectedToken: '',
      tokens: [],
      loadingTokens: false,
      suppressWatcher: false,
      designs: [
        { id: 1, image: pw1, textColor: 'black', addressColor: 'white' },
        { id: 2, image: pw2, textColor: 'white', addressColor: 'black' },
        { id: 3, image: pw3, textColor: 'white', addressColor: 'black' },
        { id: 4, image: pw4, textColor: 'white', addressColor: 'black' },
        { id: 5, image: pw5, textColor: 'white', addressColor: 'black' },
        { id: 6, image: pw6, textColor: 'white', addressColor: 'black' },
        { id: 7, image: pw7, textColor: 'white', addressColor: 'black' },
        { id: 8, image: pw8, textColor: 'white', addressColor: 'black' },
        { id: 9, image: pw9, textColor: 'white', addressColor: 'black' },
        { id: 10, image: pw10, textColor: 'white', addressColor: 'black' },
      ],
    };
  },

    async created() {
      document.body.classList.toggle("dark-mode", this.isDarkMode);
      document.body.classList.toggle("light-mode", this.isLightMode);
      
    try {
      const res = await fetch("https://watchtower.cash/api/cashtokens/fungible/?limit=100&offset=1");
      const data = await res.json();

    // Filter only valid tokens (have both name and symbol)
      this.tokens = data.results.filter(t => 
      t.name && t.symbol && t.image_url &&
      !t.image_url.startsWith('ipfs://') && !t.image_url.includes("ipfs.dweb.link"));
    } catch (err) {
      console.error("Failed to fetch tokens from Watchtower:", err);
    } finally {
      this.loadingTokens = false;
    }
  },

      computed: {
      selectedTokenObject() {
    return this.tokens.find(token => token.name === this.selectedToken);
    },

      availableAmounts() {
    if (this.selectedAsset === 'Token') 
    {
      return [0.25, 0.75, 1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    } else {
      return [0.0001, 0.001, 0.005, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 5, 10];
    }
  },

  customAmountOptions() {
  if (this.selectedAsset === 'Token') {
    return [0.25, 0.75, 1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  } else {
    return [0.0001, 0.001, 0.005, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 5, 10];
  }
},


},

      methods: {
      handleAssetChange() {
      if (this.selectedAsset !== 'Token') 
      {
          this.selectedToken = null;
      }
    },

        
      toggleAdvanceSettingdropdown() {
          this.showAdvanceSettingdropdown = !this.showAdvanceSettingdropdown;
      if (this.showAdvanceSettingdropdown) 
      {
          this.generatedWallets = [];
          this.firstWallet = [];  
      } else  {
          this.resetWallet();  
      }
    },

      resetWallet() {
          this.showAdvanceSettingdropdown = false; 
          this.encryptOption = false; 
          this.passphrase = '';  
          this.encryptedWIF = null; 
          this.originalWIF = null;  
          this.generatedWallets = [];  
          this.generateMultipleKeys();  
    },
        

      toggleDarkMode() {
          this.isDarkMode = !this.isDarkMode;
          this.isLightMode = !this.isLightMode; 
          
          localStorage.setItem("darkMode", this.isDarkMode);
          localStorage.setItem("lightMode", this.isLightMode);
          
          document.body.classList.remove("light-mode", "dark-mode");
      if (this.isDarkMode) 
      {
          document.body.classList.add("dark-mode");
          document.body.classList.remove("light-mode");
      } else {
        document.body.classList.add("light-mode");
        document.body.classList.remove("light-mode");
      }
    },
          
    async sha256(data = '', encoding = 'utf8') 
    {
      let buffer;
      if (data instanceof Uint8Array) 
      {
        buffer = data;
      } else if (encoding === 'utf8') 
      {
        buffer = new TextEncoder().encode(data);
      } else if (encoding === 'hex') 
      {
        buffer = this.hexToBin(data);
      } else {
        throw new Error('Unsupported encoding type');
      }

          
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      return this.binToHex(new Uint8Array(hashBuffer));
    },
        binToHex(uint8Array) 
    {
      return Array.from(uint8Array)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
    },

          
        hexToBin(hex) {
      return new Uint8Array(
        hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
      );
    },

          
        binToBase58(uint8Array) 
    {
      return bs58.encode(uint8Array); 
          
    },

        ripemd160(buffer) 
    {
      return new Uint8Array(
        CryptoJS.RIPEMD160(CryptoJS.enc.Hex.parse(this.binToHex(buffer)))
        .toString(CryptoJS.enc.Hex)
        .match(/.{1,2}/g)
        .map(byte => parseInt(byte, 16))
      );
    },

        encodeCashAddress({ prefix, type, payload }) 
    {
      return cashaddr.encode(prefix, type.toUpperCase(), payload);
    },

          
    async generateNewKeys() {
      const privateKey = await this.generatePrivateKey();
      this.privateKeyWIF = privateKey.wif;
      this.publicKeyHex = privateKey.publicKey;
      this.bitcoinCashAddress = privateKey.address;
      await this.generatePublicQRCodes();
    },
        generatePublicKey(privateKeyHex) {
      const privateKey = Buffer.from(privateKeyHex, 'hex');
      const publicKey = secp256k1.getPublicKey(privateKey, true);  
          
      return publicKey.toString('hex');
    },

          
        generateBCHAddress(publicKeyHex) {
      const publicKeyHash = this.ripemd160(this.sha256(publicKeyHex));  
          
      return `bitcoincash:${publicKeyHash}`;  
          
    },

          
    async generatePrivateKey() {
          
      const privateKey = new Uint8Array(32);
        window.crypto.getRandomValues(privateKey);

          
      const publicKey = secp256k1.publicKeyCreate(privateKey, true);

      const privateKeyHex = this.binToHex(privateKey);
      const publicKeyHex = this.binToHex(publicKey);

      const sha256Hash = await this.sha256(publicKeyHex, 'hex');
      const ripemdHash = this.ripemd160(this.hexToBin(sha256Hash));

          
      const extendedKey = new Uint8Array([0x80, ...privateKey, 0x01]); 
      const hashWif1 = await this.sha256(extendedKey, 'hex');
      const hashWif2 = await this.sha256(this.hexToBin(hashWif1), 'hex');
      const checksumWif = this.hexToBin(hashWif2).slice(0, 4);
      const wifKey = new Uint8Array([...extendedKey, ...checksumWif]);
      const finalWIF = this.binToBase58(wifKey);

      let encryptedWIF = null;

      if (this.encryptOption && this.passphrase) 
      {
        encryptedWIF = bip38.encrypt(Buffer.from(privateKey), true, this.passphrase);
        console.log("Encrypted WIF:", encryptedWIF);
      }

      return {
        privateKey: privateKeyHex,
        publicKey: publicKeyHex,
        address: this.encodeCashAddress({
          prefix: "bitcoincash",
          type: "P2PKH",
          payload: ripemdHash,
        }),
        wif: finalWIF,
        encryptedWIF: encryptedWIF || null,
      };
    },
        

    async generateMultipleKeys() 
    {
      this.loading = true;
      if (this.encryptOption) 
    {
      this.wallets = [];
      this.bip38Enabled = true;
    } else {
      this.bip38Enabled = false;
    }
      const MAX_WALLETS = 10; 

        
      if (!this.addressCount || this.addressCount < 1) 
    {
        this.addressCount = 0;
    }

        
      if (!this.selectedDesign) 
    {
        return;
    }

        this.customAmount = this.paymentDetails ? parseFloat(this.paymentDetails) : 0;

        
      if (this.generatedWallets.length === 0) 
    {
      const firstWallet = await this.generatePrivateKey();
      if (!firstWallet || !firstWallet.address || !firstWallet.wif) 
    {
        return;
    }

      try {
          const qrDataPublic = this.customAmount > 0
            ? `${firstWallet.address}?amount=${this.customAmount}`
            : firstWallet.address;
            firstWallet.qrCodePublic = await QRCode.toDataURL(qrDataPublic);

            firstWallet.qrCodePrivate = await QRCode.toDataURL(firstWallet.encryptedWIF ? firstWallet.encryptedWIF : firstWallet.wif);
        } catch (error) {
            console.error("QR Code generation failed for static wallet:", error);
        }

        firstWallet.customAmount = this.customAmount;
        firstWallet.design = { ...this.selectedDesign };
        this.generatedWallets.push(firstWallet);
    }

        
        this.addressCount = Math.min(Math.max(this.addressCount, 0), MAX_WALLETS);

        
      if (this.generatedWallets.length > this.addressCount) {
        
        this.generatedWallets = [this.generatedWallets[0], ...this.generatedWallets.slice(1, this.addressCount)];
    }

        
      while (this.generatedWallets.length < this.addressCount) {
      if (this.generatedWallets.length >= MAX_WALLETS) {
        console.warn(`Wallet generation limit reached! Max allowed: ${MAX_WALLETS}`);
          break;
      }

      await new Promise(resolve => setTimeout(resolve, 500)); 
        

      const wallet = await this.generatePrivateKey();
      if (!wallet || !wallet.address || !wallet.wif) {
        console.error(`Wallet #${this.generatedWallets.length + 1} generation failed!`);
          continue;
      }

      try {
        const qrDataPublic = this.customAmount > 0
        ? `${wallet.address}?amount=${this.customAmount}`
        : wallet.address;
        wallet.qrCodePublic = await QRCode.toDataURL(qrDataPublic);

        wallet.qrCodePrivate = await QRCode.toDataURL(wallet.encryptedWIF ? wallet.encryptedWIF : wallet.wif);
    } catch (error) {
        console.error(`QR Code generation failed for wallet #${this.generatedWallets.length + 1}:`, error);
    }

        wallet.customAmount = this.customAmount;
        wallet.design = { ...this.selectedDesign };

        this.generatedWallets.push(wallet);
    }
        this.loading = false; 
    },

        
      async updatePublicQRCodes() {
      if (!this.generatedWallets.length) {
          console.error("No generated wallets found!");
          return;
    }   

      const amount = this.paymentDetails ? parseFloat(this.paymentDetails) : 0;

      for (const wallet of this.generatedWallets) {
      wallet.customAmount = amount; 

       
      const cleanAddress = wallet.address.replace(/^bitcoincash:/, '');

      
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
      async updateQRCodeForWallet(wallet) {
      if (!wallet || !wallet.address) return;

      const cleanAddress = wallet.address.replace(/^bitcoincash:/, '');
      let qrDataPublic = `bitcoincash:${cleanAddress}`;

      if (this.individualWalletOption && wallet.customAmount > 0) {
      qrDataPublic += `?amount=${wallet.customAmount}`;
    }
    try {
      wallet.qrCodePublic = await QRCode.toDataURL(qrDataPublic);
  } catch (error) {
      console.error(`Error updating QR code for ${wallet.address}:`, error);
  }
},

      generateQRCode(address, amount) {
    return `https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=bitcoincash:${address}?amount=${amount}`;
  },


      
      async printWallet() {
  
  const originalIndividualWalletOption = this.individualWalletOption;
  const originalSuppressWatcher = this.suppressWatcher;

  this.suppressWatcher = true;
  this.individualWalletOption = false;

  await this.$nextTick();
  await new Promise(resolve => setTimeout(resolve, 200)); 

  const printable = document.getElementById("printable-wallet");
  if (!printable) {
    console.error("Printable wallet section not found!");
    return;
  }

  const canvas = await html2canvas(printable, { scale: 2, useCORS: true });
  const imageData = canvas.toDataURL("image/png");
  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
    <html>
      <head>
        <title>Print Wallet</title>
        <style>
          body { text-align: center; margin: 0; padding: 0; }
          img { height: auto; width: auto; max-width: 1000px; }
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
    
  setTimeout(() => {
    printWindow.close();
      
      this.individualWalletOption = originalIndividualWalletOption;
      this.suppressWatcher = originalSuppressWatcher;
      
    }, 500);
  }, 100);
},


        
      toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    if (!this.dropdownOpen) {
      this.selectedDesign = true;
      this.activeStep = 2;
    }
  },

      
      selectDesign(design) {
      this.selectedDesign = design;
      this.dropdownOpen = false;
      this.activeStep = 2;
  },

       
      toggleStep(step) {
      this.activeStep = this.activeStep === step ? null : step;
  },

      
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

    watch: {
      individualWalletOption(newVal) {
    if (this.suppressWatcher) return;

    if (newVal) {
      this.generatedWallets.forEach(wallet => {
        wallet.customAmount = ""; 
        this.updateQRCodeForWallet(wallet); 
      });
    } else {
      const amount = this.paymentDetails ? parseFloat(this.paymentDetails) : 0;
      this.generatedWallets.forEach(wallet => {
        wallet.customAmount = amount;
        this.updateQRCodeForWallet(wallet);
      });
    }
  }
  } 
  };
</script>



<style scoped>
.individual-wallet-section {
  margin-left: 10px;
  margin-top: 15px;
}

.individual-custom-amount {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: #333;
  user-select: none;
  margin: 0.5rem 0;
}

.individual-custom-amount input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: #3b82f6; /* Tailwind's blue-500 */
  cursor: pointer;
}

.dark .individual-custom-amount {
  color: #ddd;
}


.bip38-label {
  text-align: center;
  margin-bottom: 10px;
  transform: translateX(-50%) rotate(-180deg);
}

.tooltip-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.tooltip-text {
  line-height: 25px;
  visibility: hidden;
  width: 350px;
  background-color: #E2E8F0;
  color: rgb(51, 65, 85);
  text-align: left;
  padding: 8px 10px;
  border-radius: 5px;
  font-size: 0.85em;
  position: absolute;
  z-index: 1;
  top: 125%;
  left: 50%;
  transform: translateX(-50%)translateY(-130%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tooltip-container:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

.advanced-settings-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.what-is-this {
  font-size: 10px;
  color: rgb(51, 65, 85);
}

.passphrase {
  margin-left: 20px;
}

.passphrase-input {
  padding: 4px 6px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.generate-btn {
  padding: 6px 10px;
  background-color: rgb(239, 246, 255);
  color: rgb(51, 65, 85);
  font-size: 15px;
  border: 2px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.generate-btn:hover {
  background-color: #E2E8F0;
  opacity: 10px;
}

.encryption {
  padding: 5px 10px;
  cursor: pointer;
  border: 1px solid #333;
  font-size: 13px;
  font-family: 'Lexend';
  margin-left: 40px;
  border-radius: 4px;
}

.dropdown-panel {
  margin-top: 10px;
  background-color: #f9f9f9;
  border-top: 1px solid #00cfcf;
  padding: 10px;
  width: 767px;
  display: relative;
}

.dropdown-panel input[type = "text"] {
  margin-left: 5px;
  padding: 4px;
  width: 250px;
}

.loader-wrapper {
  position: relative;
  display: inline-block;
}

.spinner {
  position: absolute;
  top: 40%;
  left: 18.5%;
  width: 18px;
  height: 18px;
  border: 2px solid #ccc;
  border-top: 2px solid #077732;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.input-bar {
  width: 60px;
  height: 23px;
  padding: 4px;
  margin-top: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Dark Mode */
.dark-mode .landing-header {
  background-color: #2c3440;
  color: white;
}

.dark-mode .header-padding {
  background-color: rgb(239, 246, 255);
  color: white;
}

.dark-mode .header-padding-text {
  color: #2c3440;
}

.dark-mode .landing-container,
.dark-mode .customization-section {
  background-color: #2c3440;
  color: white;
}

.dark-mode .customization-section {
  background-color: #E2E8F0;
  color: black;
}

.dark-mode .wallet-container {
  background-color: rgb(239, 246, 255);
  color: white;
}

.dark-mode .step-label1,
.dark-mode .step-label3 {
  background-color: #515863;
}

.dark-mode .step-label2 {
  background-color: #E63946;
}

/* Ensure specific text updates in dark mode */
.dark-mode .site-title,
.dark-mode .wallet-description {
  color: #E2E8F0 !important;
}

/* Light Mode */
.light-mode .landing-container,
.light-mode .landing-header,
.light-mode .wallet-container {
  background-color: rgb(239, 246, 255);
  color: black;
}

/* Ensure specific text updates in light mode */
.light-mode .site-title,
.light-mode .wallet-description{
  color: rgb(51, 65, 85) !important;
}

.light-mode .customization-section {
  background-color: #E2E8F0;
  color: black;
}


.toggle-button {
  position: fixed;
  top: 6px;
  right: 35px;
  width: 40px;
  height: 40px;
  background: #EEDC82;
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
  position: absolute;
  position: fixed;
  position: fixed;
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



.landing-container {
  position: fixed;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  height: 100vh;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: "Poppins", sans-serif;
  overflow-y: auto;
  overflow-y: auto;
  overflow-x: hidden;
}

.landing-header {
  background-color: white;
  width: 100%;
  padding: 1% 1%;
  width: 100%;
  padding: 1% 1%;
  top: 0;
  left: 0;
  z-index: 1000;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  position: absolute;
}

.header-padding {
  width: 100%;
  height: 70px;
  background-color: rgb(30 41 59 );
  margin-top: 4%;
  margin-bottom: 4%;
  display: flex;
  padding: 5px 50px;
  align-items: center;
  text-align: center;
  justify-content: center;
  width: 100%;
  height: 70px;
  background-color: rgb(30 41 59 );
  margin-top: 4%;
  margin-bottom: 4%;
  display: flex;
  padding: 5px 50px;
  align-items: center;
  text-align: center;
  justify-content: center;
}

.header-padding-text {
font-size: 25px;
font-weight: bold;
color: white;
margin-top: 25px;
font-family: 'Lexend';
}

.site-logo {
width: 25px;
height: 25px;
}

.paper5-logo {
width: 45px;
height: 45px;
margin-right:5px;
margin-top: 10px;
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
  width: 200%;
  margin: 20px auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  background-color: #E2E8F0;
}

.wallets-container {
  display: grid;
  gap: 0.1rem;
  padding: 1rem;
  width: 60vw;
  margin-left: -2%;
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
  padding: 3.5%;
  background-color: rgb(51 65 85);
  color: white;
  cursor: pointer;
  height: 30px;
}

.step-label2 {
  display: flex;
  align-items: center;
  padding: 3.5%;
  background-color: #e05458;
  color: white;
  cursor: pointer;
  height: 30px;
}

.step-label3 {
  display: flex;
  align-items: center;
  padding: 3.5%;
  background-color: rgb(51 65 85);
  color: white;
  cursor: pointer;
  height: 30px;
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
  margin-right: 1px;
}

.address {
  font-weight: bold;
  margin-left: 10px;
}

.input-bar {
  width: 30px;
  margin-left: 1px;
  margin-top: 10px;
}

.amount {
  width: 10px;
}

.customization-section {
  padding: 10px;
  background-color: #E2E8F0;
}

.design-grid {
  display: grid;
  margin-left: 60px;
  margin-right: 50px;
  gap: 13px;
  justify-content: center;
  align-items: center;
  grid-template-columns: repeat(2, 1fr);
}

.design-preview {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.design-preview img {
  width: 100%;
  height: auto;
  object-fit: contain;
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
  font-family: 'Lexend', sans-serif;
  font-size: 100px;
  position: absolute;
  bottom: 90px;
  background: rgb(51 65 85);
  color: #ccc;
  border: none;
  padding: 15px 30px;
  width: 200px;
  height: 30px;
  border-radius: 10px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.4s ease-in-out, transform 0.5s ease-in-out;
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
  padding-top: 10px;
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
  right: 100.9px;
  top: 90px;

}

.selected-design .private-section {
  position: absolute;
  display: flex;
  left: 10.2px;
  top: 42px;
}

.wallet-address{
  position: absolute;
  font-size: 0.8rem;
  color: black;
  font-weight: bold;
  top: 3%;
  left: 71%;
  transform: translateX(-50%);
  white-space: nowrap;
  max-width: 90%
}

.private-key {
  font-weight: 90%;
  color: white;
  position: absolute;
  font-size: 10.9px;
  top: 17vh;
  left: 18%;
  right: 36.3%;
  transform: translateX(-53%) translateY(90%) rotate(-45.7deg);
  white-space: nowrap;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bch-amount {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: clamp(1.2rem, 1vw, 1.5rem);
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
  transform: translateX(-50%) rotate(-180deg);
  bottom: -30px;
  left: 90px;
}

.wallet-padding {
  margin-top: 2.2%;
  margin-bottom: 2.2%;
  padding-top: 0%;
  padding: 0%;
  padding-bottom: 0%;
}

/*         Start Media            */





/* 1440 above  */
@media (max-width: 2560px) {
  .landing-container,
  .landing-header {
    width: 100vw;
  }
  .wallet-container {
    padding-right: 1.2%;
    max-width: 58vw;
  }
  .wallet-description {
    margin-top: 0%;
    font-size: 2.5rem;
  }
  .wallets-container {
    width: 56vw;
  }
  .loader-wrapper {
    margin-right: 4%;
  }
  
  .dropdown-panel {
    width: 54vw;
  }
  .selected-design .qr-code {
  width: 6.9rem;
  height: 6.9rem;
}
.selected-design .public-section {
    right: 6.5% !important;
    top: 12.5% !important;
  }
  .selected-design .private-section {
    left: -0.7% !important;
    top: 3.8% !important;
  }
  .private-key {
    top: 21%;
    left: 19%;
    right: 36%;
    font-size: clamp(0.7em, 0.9em, 0.6em);
  }
  .wallet-address {
    font-size: clamp(0.9em, 0.9em, 0.6em );
    left: 75%;
    top: 33px;
  }
  .bch-amount {
    margin-left: 16.3%;
    margin-right: -10%;
  }
  
  .select-button {
    font-size: 0.8rem;
    line-height: 2%;
    margin-bottom: -7%;
  }
  .site-title{
    font-size: 20px;
  }
  .site-logo{
    height: 30px;
    width: 30px;
  }
  .wallet-description {
    font-size: 1.6rem;
  }
  .wallet-container {
    width: 60vw;
  }
  .step-label1 .step-text,
  .step-label2 .step-text,
  .step-label3 .step-text {
    font-size: 1.1rem;
  }
}





@media (max-width: 1440px) {
  .landing-container,
  .landing-header {
    width: 100vw;
  }
  .wallet-container {
    padding-right: 1.2%;
    max-width: 58vw;
  }
  .wallet-description {
    margin-top: 0%;
  }
  .wallets-container {
    width: 56vw;
  }
  .loader-wrapper {
    margin-right: 4%;
  }
  
  .dropdown-panel {
    width: 54vw;
  }
  .selected-design .qr-code {
  width: 6.9rem;
  height: 6.9rem;
}
  .selected-design .public-section {
    right: 6.5% !important;
    top: 12% !important;
  }
  .selected-design .private-section {
    left: -0.9% !important;
    top: 4% !important;
  }
  .private-key {
    top: 21%;
    left: 19%;
    right: 36%;
    font-size: clamp(0.7em, 0.9em, 0.6em);
  }
  .wallet-address {
    font-size: clamp(0.9em, 0.9em, 0.6em );
    left: 75%;
    top: 33px;
  }
  .bch-amount {
    margin-left: 16.3%;
    margin-right: -10%;
  }
  
  .select-button {
    font-size: 0.8rem;
    line-height: 2%;
    margin-bottom: -7%;
  }
}

@media (max-width: 1024px) {
  .private-key {
    top: 5%;
  }
  .dropdown-panel {
    width: 53vw;
  }

  .landing-container,
  .landing-header {
    width: 100vw;
  }
  .wallet-container {
    padding-right: 1.2%;
    max-width: 58vw;
  }
  .wallet-description {
    margin-top: 0%;
  }
  .wallets-container {
    width: 56vw;
  }
  .loader-wrapper {
    margin-right: 4%;
  }
  .selected-design .qr-code {
  width: 6.9rem;
  height: 6.9rem;
}
  .selected-design .public-section {
    right: 7.8% !important;
    top: 11% !important;
  }
  .selected-design .private-section {
    left: -2% !important;
    top: 3% !important;
  }
  .wallet-address {
    font-size: clamp(0.9em, 0.9em, 0.6em );
    left: 75%;
    top: 33px;
  }
  .bch-amount {
    margin-left: 16.3%;
    margin-right: -10%;
  }
  
  .select-button {
    font-size: 0.8rem;
    line-height: 2%;
    margin-bottom: -7%;
  }
  .site-logo{
    height: 23px;
    width: 23px
  }
  .paper5-logo{
    width: 30px;
    height: 30px;
    margin-bottom: 30px;
  }
}


@media (max-width: 900px) {
  .light-mode .landing-container,
  .light-mode .landing-header,
  .dark-mode .landing-header,
  .site-title {
    width: 100% !important;
  }
  .dropdown-panel {
    width: 52.5vw;
  }
  .site-title{
    font-size: 14px;
  }
  .site-logo{
    height: 25px;
  }
  .toggle-button{
    font-size: 15px;
    width: 30px;
    height: 30px;
  }
  .wallet-description {
    font-size: 1.2rem;
  }
  .wallet-container {
    width: 60vw;
  }
  .step-label1 .step-text,
  .step-label2 .step-text,
  .step-label3 .step-text {
    font-size: 0.8rem;
  }
  .selected-design .qr-code{
    width: 2rem;
    height: 2rem;
  }
  .selected-design .public-section {
    right: 7.8% !important;
    top: 11% !important;
  }
  .selected-design .private-section {
    left: -2% !important;
    top: 3% !important;
  }
  .wallet-address {
    font-size: 6px !important;
    margin-top: 0% !important;
    right: -18px;
  }


  .private-key {
    top: 23% !important; /* adjust slightly to prevent vertical shift */
    left: -1%;
    width: 18%;
  }
}

@media (max-width: 768px) {
  .light-mode .landing-container,
  .light-mode .wallet-container
  .site-title {
    width: 100% !important;
  }
  .wallet-description {
    margin-bottom: 0;
  }
  .light-mode .landing-header,
  .dark-mode .landing-header {
    width: 100% !important;
    padding: 7px;
  }
  .site-title{
    font-size: 13px;
  }
  .site-logo{
    height: 16px;
    width: 16px;
  }
  .toggle-button{
    font-size: 12px;
    width: 20px;
    height: 20px;
  }
  .wallet-description {
    font-size: 1rem;
  }
  .wallet-container {
    width: 80vw;
    padding-right: 10px;
    padding: 3px;
  }
  .step-label1 .step-text,
  .step-label2 .step-text,
  .step-label3 .step-text {
    font-size: 0.8rem;
  }
  .selected-design .qr-code{
    width: 2rem;
    height: 2rem;
  }
  .private-qr{
    margin-top: 2px;
    margin-left: 0;
  }
  .public-qr{
    margin-right: -17px;
    margin-top: 2px;
  }
  .design-preview{
    width: 110px;
  }
  .select-button {
    font-size: 0.6rem;
    line-height: 2%;
    margin-bottom: 1%;
    top: 40%;
    width: 100px;
    height: 1vh;
  }
  .customization-section .custom,
  .customization-section .dropdown,
  .customization-section .address,
  .customization-section .input-bar,
  .customization-section .encryption {
    font-size: 0.8rem;
  }
  .dropdown-panel {
    width: 54vw;
    height: 29vh;
  }
  .dropdown-image {
    width: 20px;
    height: 20px;
  }
  .dropdown-panel .strong,
  .dropdown-panel .advanced-settings-row {
    font-size: 0.2rem;
    bottom: 10%;
  }
  .generate-btn {
    font-size: 0.5rem;
  }
  .selected-design .public-section {
    right: 8.5% !important;
    top: 9.9% !important;
  }
  .selected-design .private-section {
    left: -3% !important;
    top: 2% !important;
  }
  .private-key {
    font-size: 0.18rem;
    top: 22%;
    margin-right: 1%;
  }
  .wallet-address {
    margin-top: 1%;
    right: -18px;
    font-size: clamp(5px, 0.7vw, 6.8px)!important;
  }
}

@media (max-width: 622px) {
  .light-mode .landing-container,
  .light-mode .wallet-container
  .site-title {
    width: 100% !important;
  }
  .wallet-description {
    margin-bottom: 0;
  }
  .light-mode .landing-header,
  .dark-mode .landing-header {
    width: 100% !important;
    padding: 7px;
  }
  .site-title{
    font-size: 13px;
  }
  .site-logo{
    height: 16px;
    width: 16px;
  }
  .toggle-button{
    font-size: 12px;
    width: 20px;
    height: 20px;
  }
  .wallet-description {
    font-size: 1rem;
  }
  .wallet-container {
    width: 80vw;
    padding-right: 10px;
    padding: 3px;
  }
  .step-label1 .step-text,
  .step-label2 .step-text,
  .step-label3 .step-text {
    font-size: 0.8rem;
  }
  .selected-design .qr-code{
    width: 2rem;
    height: 2rem;
  }
  .private-qr{
    margin-top: 2px;
    margin-left: 0;
  }
  .public-qr{
    margin-right: -17px;
    margin-top: 2px;
  }
  .design-preview{
    width: 110px;
  }
  .select-button {
    font-size: 0.6rem;
    line-height: 2%;
    margin-bottom: 1%;
    top: 40%;
    width: 100px;
    height: 1vh;
  }
  .customization-section .custom,
  .customization-section .dropdown,
  .customization-section .address,
  .customization-section .input-bar,
  .customization-section .encryption {
    font-size: 0.8rem;
  }
  .dropdown-panel {
    width: 54vw;
    height: 38vh;
  }
  .dropdown-image {
    width: 20px;
    height: 20px;
  }
  .dropdown-panel .strong,
  .dropdown-panel .advanced-settings-row {
    font-size: 0.2rem;
    bottom: 10%;
  }
  .generate-btn {
    font-size: 0.5rem;
  }
  .selected-design .public-section {
    right: 9% !important;
    top: 9.9% !important;
  }
  .selected-design .private-section {
    left: -3.5% !important;
    top: 1% !important;
  }
  .private-key {
    font-size: 0.18rem;
    top: 22%;
    margin-right: 1%;
  }
  .wallet-address {
    margin-top: 1%;
    right: -18px;
    font-size: clamp(5px, 0.6vw, 20px)!important;
  }
}

@media (max-width: 590px) {
  .light-mode .landing-container,
  .light-mode .wallet-container
  .site-title {
    width: 100% !important;
  }
  .wallet-description {
    margin-bottom: 0;
  }
  .light-mode .landing-header,
  .dark-mode .landing-header {
    width: 100% !important;
    padding: 7px;
  }
  .site-title{
    font-size: 13px;
  }
  .site-logo{
    height: 16px;
    width: 16px;
  }
  .toggle-button{
    font-size: 12px;
    width: 20px;
    height: 20px;
  }
  .wallet-description {
    font-size: 1rem;
  }
  .wallet-container {
    width: 80vw;
    padding-right: 10px;
    padding: 3px;
  }
  .step-label1 .step-text,
  .step-label2 .step-text,
  .step-label3 .step-text {
    font-size: 0.8rem;
  }
  .selected-design .qr-code{
    width: 2rem;
    height: 2rem;
  }
  .private-qr{
    margin-top: 2px;
    margin-left: 0;
  }
  .public-qr{
    margin-right: -17px;
    margin-top: 2px;
  }
  .design-preview{
    width: 110px;
  }
  .select-button {
    font-size: 0.6rem;
    line-height: 2%;
    margin-bottom: 1%;
    top: 40%;
    width: 100px;
    height: 1vh;
  }
  .customization-section .custom,
  .customization-section .dropdown,
  .customization-section .address,
  .customization-section .input-bar,
  .customization-section .encryption {
    font-size: 0.8rem;
  }
  .dropdown-panel {
    width: 54vw;
    height: 38vh;
  }
  .dropdown-image {
    width: 20px;
    height: 20px;
  }
  .dropdown-panel .strong,
  .dropdown-panel .advanced-settings-row {
    font-size: 0.2rem;
    bottom: 10%;
  }
  .generate-btn {
    font-size: 0.5rem;
  }
  .selected-design .public-section {
    right: 10.7% !important;
    top: 9% !important;
  }
  .selected-design .private-section {
    left: -4.7% !important;
    top: -0.1% !important;
  }
  .private-key {
    font-size: 0.18rem;
    top: 22%;
    margin-right: 1%;
  }
  .wallet-address {
    margin-top: 1%;
    right: -18px;
    font-size: clamp(5px, 0.6vw, 20px)!important;
  }
}



@media (max-width: 500px) {
  .light-mode .landing-container,
  .light-mode .wallet-container
  .site-title {
    width: 100% !important;
  }
  .wallet-description {
    margin-bottom: 0;
  }
  .light-mode .landing-header,
  .dark-mode .landing-header {
    width: 100% !important;
    padding: 7px;
  }
  .site-title{
    font-size: 13px;
  }
  .site-logo{
    height: 16px;
    width: 16px;
  }
  .toggle-button{
    font-size: 12px;
    width: 20px;
    height: 20px;
  }
  .wallet-description {
    font-size: 1rem;
  }
  .wallet-container {
    width: 80vw;
    padding-right: 10px;
    padding: 3px;
  }
  .step-label1 .step-text,
  .step-label2 .step-text,
  .step-label3 .step-text {
    font-size: 0.8rem;
  }
  .selected-design .qr-code{
    width: 2rem;
    height: 2rem;
  }
  .private-qr{
    margin-top: 2px;
    margin-left: 0;
  }
  .public-qr{
    margin-right: -17px;
    margin-top: 2px;
  }
  .design-preview{
    width: 110px;
  }
  .select-button {
    font-size: 0.6rem;
    line-height: 2%;
    margin-bottom: 1%;
    top: 40%;
    width: 100px;
    height: 1vh;
  }
  .customization-section .custom,
  .customization-section .dropdown,
  .customization-section .address,
  .customization-section .input-bar,
  .customization-section .encryption {
    font-size: 0.8rem;
  }
  .dropdown-panel {
    width: 54vw;
    height: 50vh;
  }
  .dropdown-image {
    width: 20px;
    height: 20px;
  }
  .dropdown-panel .strong,
  .dropdown-panel .advanced-settings-row {
    font-size: 0.2rem;
    bottom: 10%;
  }
  .generate-btn {
    font-size: 0.5rem;
  }
  .selected-design .public-section {
    right: 11.9% !important;
    top: 8.5% !important;
  }
  .selected-design .private-section {
    left: -5.5% !important;
    top: -1% !important;
  }
  .private-key {
    font-size: 0.18rem;
    top: 22%;
    margin-right: 1%;
  }
  .wallet-address {
    margin-top: 1%;
    right: -18px;
    font-size: 5px!important;
  }
}

@media (max-width: 443px) {
  .light-mode .landing-container,
  .light-mode .wallet-container
  .site-title {
    width: 100% !important;
  }
  .wallet-description {
    margin-bottom: 0;
  }
  .light-mode .landing-header,
  .dark-mode .landing-header {
    width: 100% !important;
    padding: 7px;
  }
  .site-title{
    font-size: 14px;
  }
  .site-logo{
    height: 16px;
    width: 16px;
  }
  .toggle-button{
    font-size: 12px;
    width: 20px;
    height: 20px;
  }
  .wallet-description {
    font-size: 1rem;
  }
  .wallet-container {
    width: 80vw;
    padding-right: 10px;
    padding: 3px;
  }
  .step-label1 .step-text,
  .step-label2 .step-text,
  .step-label3 .step-text {
    font-size: 0.8rem;
  }
  .selected-design .qr-code{
    width: 2rem;
    height: 2rem;
  }
  .private-qr{
    margin-top: 2px;
    margin-left: 0;
  }
  .public-qr{
    margin-right: -17px;
    margin-top: 2px;
  }
  .design-grid {
    display: grid;
    height: 100vh;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
  }
  .design-preview{
    width: 110px;
  }
  .select-button {
    font-size: 0.6rem;
    line-height: 2%;
    margin-bottom: 1%;
    top: 40%;
    width: 100px;
    height: 1vh;
  }
  .customization-section .custom,
  .customization-section .dropdown,
  .customization-section .address,
  .customization-section .input-bar,
  .customization-section .encryption {
    font-size: 0.6rem;
  }
  .dropdown-panel {
    width: 51vw;
    height: 50vh;
  }
  .dropdown-image {
    width: 20px;
    height: 20px;
  }
  .dropdown-panel .strong,
  .dropdown-panel .advanced-settings-row {
    font-size: 0.2rem;
    bottom: 10%;
  }
  .generate-btn {
    font-size: 0.5rem;
  }
  .selected-design .public-section {
    right: 13% !important;
    top: 7.8% !important;
  }
  .selected-design .private-section {
    left: -7% !important;
    top: 0.1% !important;
  }
  .private-key {
    font-size: 0.18rem;
    top: 22%;
    margin-right: 1%;
  }
  .wallet-address {
    font-size: 3.2px !important;
    margin-top: 0% !important;
    right: -18px;
  }
  .bch-amount {
    margin-bottom: 10%;
  }
  .bip38-label {
    top: 70% !important;
    padding: 0.5em 0.5em !important;
  }
}




@media (max-width: 425px) {
  .light-mode .landing-container,
  .light-mode .wallet-container
  .site-title {
    width: 100% !important;
  }
  .wallet-description {
    margin-bottom: 0;
  }
  .light-mode .landing-header,
  .dark-mode .landing-header {
    width: 100% !important;
    padding: 7px;
  }
  .site-title{
    font-size: 14px;
  }
  .site-logo{
    height: 16px;
    width: 16px;
  }
  .toggle-button{
    font-size: 12px;
    width: 20px;
    height: 20px;
  }
  .wallet-description {
    font-size: 1rem;
  }
  .wallet-container {
    width: 80vw;
    padding-right: 10px;
    padding: 3px;
  }
  .step-label1 .step-text,
  .step-label2 .step-text,
  .step-label3 .step-text {
    font-size: 0.8rem;
  }
  .selected-design .qr-code{
    width: 2rem;
    height: 2rem;
  }
  .private-qr{
    margin-top: 2px;
    margin-left: 0;
  }
  .public-qr{
    margin-right: -17px;
    margin-top: 2px;
  }
  .design-grid {
    display: grid;
    height: 100vh;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
  }
  .design-preview{
    width: 110px;
  }
  .select-button {
    font-size: 0.6rem;
    line-height: 2%;
    margin-bottom: 1%;
    top: 40%;
    width: 100px;
    height: 1vh;
  }
  .customization-section .custom,
  .customization-section .dropdown,
  .customization-section .address,
  .customization-section .input-bar,
  .customization-section .encryption {
    font-size: 0.6rem;
  }
  .dropdown-panel {
    width: 51vw;
    height: 50vh;
  }
  .dropdown-image {
    width: 20px;
    height: 20px;
  }
  .dropdown-panel .strong,
  .dropdown-panel .advanced-settings-row {
    font-size: 0.2rem;
    bottom: 10%;
  }
  .generate-btn {
    font-size: 0.5rem;
  }
  .selected-design .public-section {
    right: 13% !important;
    top: 7.8% !important;
  }
  .selected-design .private-section {
    left: -7% !important;
    top: 0.1% !important;
  }
  .private-key {
    font-size: 0.18rem;
    top: 22%;
    margin-right: 1%;
  }
  .wallet-address {
    font-size: 3.2px !important;
    margin-top: 0% !important;
    right: -18px;
  }
  .bch-amount {
    margin-bottom: 10%;
  }
  .bip38-label {
    top: 70% !important;
    padding: 0.5em 0.5em !important;
  }
}

@media (max-width: 375px) {
  .light-mode .landing-container,
  .light-mode .wallet-container
  .site-title {
    width: 100% !important;
  }
  .wallet-description {
    margin-bottom: 0;
  }
  .light-mode .landing-header,
  .dark-mode .landing-header {
    width: 100% !important;
    padding: 7px;
  }
  .site-title{
    font-size: 11px;
  }
  .site-logo{
    height: 16px;
    width: 16px;
  }
  .toggle-button{
    font-size: 12px;
    width: 20px;
    height: 20px;
  }
  .wallet-description {
    font-size: 1rem;
  }
  .wallet-container {
    width: 80vw;
    padding-right: 10px;
    padding: 3px;
  }
  .step-label1 .step-text,
  .step-label2 .step-text,
  .step-label3 .step-text {
    font-size: 0.6rem;
  }
  .selected-design .qr-code{
    width: 2rem;
    height: 2rem;
  }
  .private-qr{
    margin-top: 2px;
    margin-left: 0;
  }
  .public-qr{
    margin-right: -17px;
    margin-top: 2px;
  }
  .design-grid {
    display: grid;
    height: 100vh;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
  }
  .design-preview{
    width: 110px;
  }
  .select-button {
    font-size: 0.6rem;
    line-height: 2%;
    margin-bottom: 1%;
    top: 40%;
    width: 100px;
    height: 1vh;
  }
  .customization-section .custom,
  .customization-section .dropdown,
  .customization-section .address,
  .customization-section .input-bar,
  .customization-section .encryption {
    font-size: 0.3rem;
  }
  .dropdown-panel {
    width: 51vw;
    height: 55vh;
  }
  .dropdown-image {
    width: 20px;
    height: 20px;
  }
  .dropdown-panel .strong,
  .dropdown-panel .advanced-settings-row {
    font-size: 0.2rem;
    bottom: 10%;
  }
  .generate-btn {
    font-size: 0.5rem;
  }
  .selected-design .qr-code {
  width: 1.4rem !important;
  height: 1.4rem !important;
}
  .selected-design .public-section {
    right: 13% !important;
    top: 7% !important;
  }
  .selected-design .private-section {
    left: -7.8% !important;
    top: -1% !important;
  }
  .private-key {
    font-size: 2px !important;
    top: 21% !important;
    margin-right: 1%;
  }
  .wallet-address {
    font-size: 2.6px !important;
    margin-top: 5%;
    right: -18px;
  }
  .bch-amount {
    margin-bottom: 13%;
  }
  .bip38-label {
    top: 70% !important;
    padding: 0.5em 0.5em !important;
  }
   
}

</style>
