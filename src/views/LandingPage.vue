
<template>
  <div class="landing-container">

    <header class="landing-header">
      <img src="@/assets/paytaca.jpg" alt="Paytaca Logo" class="site-logo">
      <h2 class="site-title">Paytaca.com</h2>
    </header>

    <div class="header-padding">
        
      <h1 class="header-padding-text">Bitcoin Cash (BCH) Paper Wallet</h1>
    </div>

    <p class="wallet-description">
      Move your mouse to generate a Bitcoin Cash (BCH) Address
    </p>
    
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
export default {
  name: "BCHHashGenerator",
  data() {
    return {
      entropy: "",
      manualEntropy: "",
      progress: 0,
      generatedHash: "",
      hashGenerated: false,
      jumbledText: this.generateJumbledText(), 
      offsetX: 0,
      offsetY: 0
    };
  },
  mounted() {
    // Listen to mousemove events at the window level
    window.addEventListener("mousemove", this.captureEntropy);
  },
  beforeDestroy() {
    // Remove event listener when component is destroyed
    window.removeEventListener("mousemove", this.captureEntropy);
  },
  methods: {
    captureEntropy(event) {
      if (this.hashGenerated || this.progress >= 100) return;

      // Capture global mouse movement
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
      if (this.hashGenerated || this.progress >= 100) return;

      this.entropy += this.manualEntropy;
      this.progress += 0.1;

      if (this.progress >= 100) {
        this.progress = 100;
        this.generateAddress();
      }
    },
    async generateAddress() {
      const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(this.entropy));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      this.generatedHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      this.hashGenerated = true;

      this.redirectToHeader();
    },
    redirectToHeader() {
      this.$router.push("/header");
    },
    generateJumbledText() {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      return Array.from({ length: 35 }) 
        .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
        .join("");
    }
  }
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap');

.lexend {
  font-family: "Lexend", serif;
  font-optical-sizing: auto;
  font-weight: bold;
  font-style: normal;
}


.wallet-description {
  text-align: center;
  font-size: 30px;
  font-weight: bold;
  color: rgb(51 65 85);
  margin-top: -80px;
  margin-bottom: 20px;
  font-family: 'Lexend';
}

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
  padding: 15px 30px;
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



.paper5-logo {
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
  height: 200px;
  background-color: rgb(30 41 59 );
  margin-top: 1px;
  margin-bottom: 100px;
  display: flex;
  padding: 15px 30px;
  align-items: center;
  text-align: center;
  justify-content: center;
}

.header-padding-text {
  font-size: 30px;
  font-weight: bold;
  color: white;
  margin-top: 100px;
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