/**
 * Configuration file for customizable assets
 *
 * This file allows you to easily customize the background images and logo
 * used throughout the application without modifying component code.
 */

import contractAbi from "./contractAbi"
import shakingContractAbi from "./shakingContractAbi"

export default {
  // contract configuration
  // contractAddress: "0x87F9cF06324516cD18C9BFb090B71C7f517154c2",
  contractAddress: "0xb63214B454c08eBD7bb025F51E2278F0c10B113A",
  shakingContractAddress: '0x35499aa163f85e5694ccb95e28614e65e3d5503e',
  USDTAddress: '0x55d398326f99059fF775485246999027B3197955',
  contractAbi: contractAbi,
  shakingContractAbi: shakingContractAbi,
  creatorAddress: '0xC1a51fFB47b9621C3789359b17f0d44234360FD0',
  // Logo configuration
  logo: {
    path: 'https://wufeng98.cn/imgServerApi/images/084ea8d1-3406-4ce0-8cca-c7c5e02de238.png',
    // Alternative text for accessibility
    alt: 'RWA Logo',
  },
  
  // Background images
  backgrounds: {
    // Home page background
    home: 'https://wufeng98.cn/imgServerApi/images/27b080e8-a759-4906-a03c-52cea334ef18.jpg',
    // Friends page background
    friends: 'https://wufeng98.cn/imgServerApi/images/98aa5819-1c70-4d04-bc76-70a60e3a5915.jpg',
    // Box page background
    box: 'https://wufeng98.cn/imgServerApi/images/d593f58c-cb6e-4873-ac28-ca0c4d38d727.jpg',
  },
  
  // Mascot image (green cat in the screenshots)
  mascot: {
    path: '/path/to/your/mascot.png',
    alt: 'Alpha Mascot',
  },
  
  // Mystery box image
  mysteryBox: {
    path: '/path/to/your/mystery-box.png',
    alt: 'Mystery Box',
  },
  
  qqGroup: {
    number: '961322634',
  },
  
  // Social media links
  socialLinks: [
    {
      name: 'Gitbook',
      url: '',
      icon: 'github'
    },
    {
      name: 'Twitter',
      url: '',
      icon: 'twitter'
    },
    // {
    //   name: 'Telegram',
    //   url: '',
    //   icon: 'telegram'
    // }
  ],
}
