<div align="center">
  <img src="/miracle_logo.png" alt="MIRACLE API Logo" width="600"/>
  <h1>MIRACLE API</h1>
  <p><strong>MR Imaging Reference API for Cardiovascular Limits from Evidence</strong></p>

  [![Open Source](https://img.shields.io/badge/Open-Source-green.svg)](https://github.com/drankush/MIRACLE)
  [![API Documentation](https://img.shields.io/badge/Docs-readme.io-blue.svg)](https://miracleapi.readme.io)
  [![Google Apps Script](https://img.shields.io/badge/Powered%20by-Google%20Apps%20Script-orange.svg)](https://developers.google.com/apps-script)
  [![SCMR 2026](https://img.shields.io/badge/SCMR-2026%20Submission-red.svg)](https://scmr.org)
  [![Netlify Demo](https://img.shields.io/badge/Demo-Netlify-00C7B7.svg)](https://miracle-chat.netlify.app)
</div>

## 🌟 Introduction

MIRACLE is an open-source API that provides evidence-based reference values for cardiovascular magnetic resonance (CMR) measurements. It standardizes the interpretation of CMR studies by offering instant access to peer-reviewed normal ranges, z-scores, and percentiles across multiple clinical domains.

## 🚀 Live Demos

- **Z-score Calculator**: [miracle-webapp.netlify.app](https://miracle-webapp.netlify.app)
- **Interactive Chatbot**: [miracle-chat.netlify.app](https://miracle-chat.netlify.app)

## ✨ Key Features

- 📊 Evidence-based reference values
- 🔓 Open-access API
- 🏥 Multiple clinical domains
- 🧮 Real-time z-score calculations
- 📈 Percentile computations
- 🤖 AI/LLM integration ready
- 📱 REST API with flexible endpoints

## 🛠️ Getting Started

### Basic API Call

```bash
curl -X GET "https://script.google.com/macros/s/AKfycbwa0oPunWWhNhvdQZXDj3Sd01f_onFN2DHOg-LpEfMVqQWuFxZov0ZgRhK9Oia94k7c/exec?domain=Pediatric_Ventricle&parameter=LVEDV&gender=Male&measured=62&ht_cm=110&wt_kg=22"
```

### Code Examples

<details>
<summary>Python</summary>

```python
import requests

url = "https://script.google.com/macros/s/..."
params = {
    "domain": "Pediatric_Ventricle",
    "parameter": "LVEDV",
    "gender": "Male",
    "measured": 62,
    "ht_cm": 110,
    "wt_kg": 22
}

response = requests.get(url, params=params)
data = response.json()
```
</details>

<details>
<summary>JavaScript</summary>

```javascript
fetch(`https://script.google.com/macros/s/...?domain=Pediatric_Ventricle&parameter=LVEDV&gender=Male&measured=62&ht_cm=110&wt_kg=22`)
  .then(response => response.json())
  .then(data => console.log(data));
```
</details>

## 📚 API Endpoints

- **Pediatric Cardiac**
  - [Ventricular Parameters](https://miracleapi.readme.io/reference/ventricular)
  - [Atrial Volumes](https://miracleapi.readme.io/reference/atrial)
  
- **Adult Cardiac** (Coming Soon)
  - Ventricular Function
  - Chamber Volumes

Full documentation available at [miracleapi.readme.io](https://miracleapi.readme.io)

## 🏥 For the SCMR Community

### Ready-to-Use Applications

1. **Z-score Calculator Web App**
   - Instant clinical parameter interpretation
   - User-friendly interface
   - [Demo & Source Code](https://github.com/drankush/MIRACLE-webapp)

2. **Virtual CMR Report Generator**
   - Comprehensive study interpretation
   - Automated reference range comparison
   - Natural language summaries

3. **LLM-Powered Chatbot**
   - Natural language processing
   - Intelligent measurement interpretation
   - [Demo & Source Code](https://github.com/drankush/MIRACLE-ChatBot)

### AI/LLM Integration

- **LLM-Ready Documentation**: Access via [miracleapi.readme.io/llms.txt](https://miracleapi.readme.io/llms.txt)
- **MCP Server**: Available at [miracleapi.readme.io/mcp](https://miracleapi.readme.io/mcp)
- **Function Calling Support**: Built-in OpenAI-compatible schemas

### Research Tools

- Batch processing capabilities
- CSV input/output support
- Statistical analysis tools

## 📖 Citation

```bibtex
@software{Gupta_MIRACLE_2025,
  author = {Gupta, Ankush},
  title = {MIRACLE: MR Imaging Reference API for Cardiovascular Limits from Evidence},
  year = {2025},
  publisher = {GitHub},
  url = {https://github.com/drankush/MIRACLE}
}
```

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

## 🤝 Contributing

We welcome contributions! See our [Contributing Guidelines](CONTRIBUTING.md) for details.

---

<div align="center">
  <p>Made with ❤️ for the CMR community</p>
  <p>
    <a href="https://miracleapi.readme.io">Documentation</a> •
    <a href="https://github.com/drankush/MIRACLE-webapp">Web App</a> •
    <a href="https://github.com/drankush/MIRACLE-ChatBot">Chatbot</a>
  </p>
</div>
