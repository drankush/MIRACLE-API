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
curl --request GET \
     --url 'https://script.google.com/macros/s/.../exec?domain=Pediatric_Ventricle&parameter=LVEDV&gender=Male' \
     --header 'accept: application/json'
```

### Code Examples

<details>
<summary>Python</summary>

```python
import requests

url = "https://script.google.com/macros/s/.../exec?domain=Pediatric_Ventricle&parameter=LVEDV&gender=Male"

headers = {"accept": "application/json"}

response = requests.get(url, headers=headers)

print(response.text)
```
</details>

<details>
<summary>JavaScript</summary>

```javascript
const options = {method: 'GET', headers: {accept: 'application/json'}};

fetch('https://script.google.com/macros/s/.../exec?domain=Pediatric_Ventricle&parameter=LVEDV&gender=Male', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```
</details>

## 📚 API Endpoints
  
### Adult Cardiac


| **Left Ventricle** | [Volumetric](https://miracleapi.readme.io/reference/getlvreferencevalues#/) | [Volumetric by Age](https://miracleapi.readme.io/reference/getlv_agereferencevalues#/) | [Functional and Geometric](https://miracleapi.readme.io/reference/getlvreference#/) | [Myocardial Thickness](https://miracleapi.readme.io/reference/getlvmtreferencevalues#/) |
|:--|:--|:--|:--|:--|
|  | [Global Strain](https://miracleapi.readme.io/reference/getlv_strain_values#/) | [Fractal Dimension by BMI](https://miracleapi.readme.io/reference/getlv_fd_bmi_values#/) | [Fractal Dimension by Ethnicity](https://miracleapi.readme.io/reference/getlv_fd_ethnicity_values#/) |  |
| **Right Ventricle** | [Volumetric](https://miracleapi.readme.io/reference/getrv_values#/) | [Volumetric by Age](https://miracleapi.readme.io/reference/getrv_age_values#/) |  |  |
| **Left Atrium** | [Diameter & Area](https://miracleapi.readme.io/reference/getla_da_values#/) | [Volume & Function](https://miracleapi.readme.io/reference/getla_vf_values#/) |  |  |
| **Right Atrium** | [Diameter & Area](https://miracleapi.readme.io/reference/getra_da_values#/) | [Volume & Function](https://miracleapi.readme.io/reference/getra_vf_values#/) |  |  |
| **Other** | [Athletes](https://miracleapi.readme.io/reference/getathletereferencevalues#/) | [T1/ECV](https://miracleapi.readme.io/reference/gett1_relax_values#/) | [T2 Relaxation](https://miracleapi.readme.io/reference/gett2relaxationvalues#/) | [Myocardial Blood Flow](https://miracleapi.readme.io/reference/getmbf_values#/) |



### Adult Vascular

| Aortic Root & Valve | Ascending Aorta | Thoracic Aorta | Aortic Elasticity | Pulmonary Artery |
|:---:|:---:|:---:|:---:|:---:|
| [Aortic Root Diameter](https://miracleapi.readme.io/reference/getaortic_root_d_values#/) | [Ascending Aortic Diameter](https://miracleapi.readme.io/reference/getaa_d_values#/) | [Thoracic Aorta Diameter](https://miracleapi.readme.io/reference/getta_d_values#/) | [Aortic Distensibility by Age](https://miracleapi.readme.io/reference/getadult_aa_distensibility_values#/) | [Adult Pulmonary Artery Dimensions](https://miracleapi.readme.io/reference/getadultpareferencevalues#/) |
| [Aortic Sinus Diameters and Area](https://miracleapi.readme.io/reference/getasl_da_values#/) | [Ascending Aorta Peak Velocity by Age](https://miracleapi.readme.io/reference/getmpsv_aa_4d_values#/) | [Thoracic Aorta Wall Thickness, Luminal Diameter](https://miracleapi.readme.io/reference/getta_d_a_wl_values#/) | [Aortic PWV by Age](https://miracleapi.readme.io/reference/getadult_pwv_values#/) |  |
| [Aortic Valve Peak Velocity](https://miracleapi.readme.io/reference/getmavpv_4d_values#/) |  |  |  |  |


### Pediatric Cardiac

| Cardiac | Vascular |
|:---:|:---:|
| [Atrial Volumes](https://miracleapi.readme.io/reference/getpediatricreferencevalues-1#/) | [Aortic CSA](https://miracleapi.readme.io/reference/getpeds_aorta_csa_zscore#/) |
| [Ventricular Parameters](https://miracleapi.readme.io/reference/getpediatricventriclereferencevalues#/) | [Ascending Aorta Distensibility](https://miracleapi.readme.io/reference/getpeds_aa_distensibility_zscore#/) |
|  | [Pulse Wave Velocity](https://miracleapi.readme.io/reference/getpeds_pwv_zscore#/) |
|  | [Aortic Diameter](https://miracleapi.readme.io/reference/getpedsaorticd#/) |
|  | [Pulmonary Artery Diameters](https://miracleapi.readme.io/reference/getpeds_pa_values#/) |


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
@software{Ankush_MIRACLE_2025,
  author = {Ankush, Ankush},
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
