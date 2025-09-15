<div align="center">
  <img src="/miracle_logo.png" alt="MIRACLE API Logo" width="600"/>
  <h1>MIRACLE API</h1>
  <p><strong>MR Imaging Reference API for Cardiovascular Limits from Evidence</strong></p>

  [![Open Source](https://img.shields.io/badge/Open-Source-green.svg)](https://github.com/drankush/MIRACLE)
  [![API Documentation](https://img.shields.io/badge/Docs-readme.io-blue.svg)](https://miracleapi.readme.io)
  [![Google Apps Script](https://img.shields.io/badge/Powered%20by-Google%20Apps%20Script-orange.svg)](https://developers.google.com/apps-script)
  [![SCMR 2026](https://img.shields.io/badge/SCMR-2026%20Submission-red.svg)](https://scmr.org)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  
  [![Netlify Demo](https://img.shields.io/badge/ChatBot-Netlify-00C7B7.svg)](https://miracle-chat.netlify.app)
  [![Surge Demo](https://img.shields.io/badge/WebApp-Surge-yellow.svg)](https://miracle-app.surge.sh)
</div>

<div align="center">
  <h2>🫀 SCMR 2026 Open Source Innovation Submission</h2>
</div>

## 🌟 Introduction

MIRACLE is an open-source API that provides evidence-based reference values for cardiovascular magnetic resonance (CMR) measurements. It standardizes the interpretation of CMR studies by offering instant access to peer-reviewed normal ranges, z-scores, and percentiles across multiple clinical domains.

<div align="center">
  <h3>
    🔗 View and Test Full API Documentation: 
    <a href="https://miracleapi.readme.io" target="_blank" rel="noopener noreferrer">
      miracleapi.readme.io
    </a>
  </h3>
</div>



## 🚀 Live Demos

- **Pediatric CMR Reference Calculator**: [miracle-app.surge.sh](https://miracle-app.surge.sh/) [![Source Code](https://img.shields.io/badge/source_code-GitHub-blue?logo=github)](https://github.com/drankush/MIRACLE-webapp/tree/main)

- **Interactive Chatbot**: [miracle-chat.netlify.app](https://miracle-chat.netlify.app) [![Netlify Status](https://api.netlify.com/api/v1/badges/c197c4ee-b90b-4be8-879d-a9305c6b9823/deploy-status)](https://app.netlify.com/projects/miracle-chat/deploys) [![Source Code](https://img.shields.io/badge/source_code-GitHub-blue?logo=github)](https://github.com/drankush/MIRACLE-ChatBot/tree/main)


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

1. **Pediatric CMR Z-score Calculator Web App**
   - React-based frontend with Material-UI components
   - Real-time validation and calculation
   - RESTful API integration with error handling
   - Mobile-responsive design
   - Print support
   - [Live Demo](https://miracle-app.surge.sh/) | [Source Code](https://github.com/drankush/MIRACLE-webapp)

2. **Virtual CMR Report Generator**
   - Batch processing of multiple parameters
   - Customizable report templates using Handlebars
   - Export options: PDF, DOCX, JSON
   - Integration examples with clinical systems
   ```javascript
   // Example report generation
   const report = await miracleAPI.generateReport({
     patient: { gender: "Male", height: 110, weight: 22 },
     measurements: {
       LVEDV: 62,
       LVEF: 60,
       LVM: 45
     },
     template: "pediatric_standard"
   });
   ```

3. **LLM-Powered Chatbot**
   - OpenAI/Groq function calling architecture
   - Natural language parsing with structured output
   - Context-aware conversation handling
   - Error boundary implementation
   - [Live Demo](https://miracle-chat.netlify.app) | [Source Code](https://github.com/drankush/MIRACLE-ChatBot)
   ```javascript
   // Example function calling schema
   {
     "name": "getPediatricVentricleZScore",
     "parameters": {
       "type": "object",
       "properties": {
         "gender": { "type": "string", "enum": ["Male", "Female"] },
         "parameter": { "type": "string", "enum": ["LVEDV", "LVEF", "LVM"] },
         "measured": { "type": "number" },
         "ht_cm": { "type": "number" },
         "wt_kg": { "type": "number" }
       }
     }
   }
   ```

### AI/LLM Integration

#### LLM-Ready Documentation
- Structured markdown format at `/llms.txt`
- Automated updates via GitHub Actions
- Endpoint schemas in OpenAPI 3.0
```bash
curl https://miracleapi.readme.io/llms.txt
# Returns markdown-formatted documentation
```

#### Model Context Protocol (MCP)
- OpenAPI specification at `/mcp`
- JSON Schema validation
- Rate limiting information
- Authentication requirements
- Read [Documentation](https://miracleapi.readme.io/reference/mcp#/)
```bash
curl https://miracleapi.readme.io/mcp
# Returns OpenAPI specification
```

#### Function Calling Support
- OpenAI-compatible function definitions
- Anthropic Claude-ready schemas
- Groq API integration examples
- Error handling patterns
```python
# Example function registration with OpenAI
tools = [{
    "type": "function",
    "function": {
        "name": "getPediatricReferenceValues",
        "description": "Get z-scores for pediatric CMR measurements",
        "parameters": { ... }
    }
}]
```

### Research Tools

#### Current Capabilities
```python
# Example: Basic batch processing with current API
import pandas as pd
import requests

def process_cmr_data(data_df):
    base_url = "https://script.google.com/macros/s/.../exec"
    results = []
    
    for _, row in data_df.iterrows():
        params = {
            "domain": "Pediatric_Ventricle",
            "parameter": row["parameter"],
            "gender": row["gender"],
            "measured": row["value"],
            "ht_cm": row["height"],
            "wt_kg": row["weight"]
        }
        response = requests.get(base_url, params=params)
        results.append(response.json())
    
    return pd.DataFrame(results)

# Usage
df = pd.read_csv("measurements.csv")
results_df = process_cmr_data(df)
results_df.to_csv("results_with_zscores.csv")
```

#### 🛣️ Future Roadmap (Planned Features)

1. **Python Package Development**
   - Dedicated `miracle-py` package
   - Easy-to-use batch processing
   - Statistical analysis utilities
   ```python
   # Future API (not yet implemented)
   from miracle import MiracleBatch
   processor = MiracleBatch()
   results = processor.process_csv(...)
   ```

2. **Research Integration Tools**
   - DICOM SR templates
   - REDCap integration
   - Data validation suite
   ```python
   # Planned feature
   from miracle.export import DicomSRExport  # Coming soon
   ```

3. **Statistical Analysis Module**
   - Advanced z-score calculations
   - Multiple BSA formulas
   - Automated outlier detection
   ```python
   # Future enhancement
   from miracle.stats import calculate_zscore  # Planned
   ```


## 📖 Citation

```bibtex
@software{Ankush_MIRACLE_2025,
  author = {Ankush, Ankush},
  title = {MIRACLE: MR Imaging Reference API for Cardiovascular Limits from Evidence},
  year = {2025},
  publisher = {GitHub},
  url = {https://github.com/drankush/MIRACLE-API}
}
```

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

<div align="center">
  <p>Made with ❤️ for the CMR community</p>
  <p>
    <a href="https://miracleapi.readme.io">Documentation</a> •
    <a href="https://github.com/drankush/MIRACLE-webapp">Web App</a> •
    <a href="https://github.com/drankush/MIRACLE-ChatBot">Chatbot</a>
  </p>
</div>
