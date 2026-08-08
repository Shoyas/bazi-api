import { BaziService } from './src/app/modules/bazi/bazi.service';
import fs from 'fs';

async function generateTestCases() {
  const cases = [
    {
      id: "001",
      birthDate: "1979-12-18",
      birthTime: "12:00",
      gender: "female",
      timezone: "Asia/Taipei",
      language: "en"
    },
    {
      id: "002",
      birthDate: "2008-11-24",
      birthTime: "03:30",
      gender: "male",
      timezone: "America/Los_Angeles",
      language: "en"
    },
    {
      id: "003",
      birthDate: "2009-12-01",
      birthTime: "09:50",
      gender: "male",
      timezone: "America/Los_Angeles",
      language: "en"
    },
    {
      id: "004",
      birthDate: "2011-05-20",
      birthTime: "08:03",
      gender: "female",
      timezone: "America/Los_Angeles",
      language: "en"
    },
    {
      id: "005",
      birthDate: "1960-02-26",
      birthTime: "12:00", // Time Unknown, defaulting to 12:00
      gender: "male",
      timezone: "Asia/Manila",
      language: "en"
    }
  ];

  let markdownOutput = '# Bazi 5 Test Cases JSON Output\n\n';

  for (const c of cases) {
    try {
      const result = await BaziService.calculateBazi(c as any);
      markdownOutput += `## Case ${c.id}\n`;
      markdownOutput += `- **DOB:** ${c.birthDate}\n`;
      markdownOutput += `- **Time:** ${c.birthTime}\n`;
      markdownOutput += `- **Gender:** ${c.gender}\n`;
      markdownOutput += `- **Timezone:** ${c.timezone}\n`;
      markdownOutput += '```json\n';
      markdownOutput += JSON.stringify(result, null, 2);
      markdownOutput += '\n```\n\n';
    } catch (e: any) {
      markdownOutput += `## Case ${c.id} - Error\n${e.message}\n\n`;
    }
  }

  // Write to artifact
  const artifactPath = "C:\\Users\\mdnas\\.gemini\\antigravity-ide\\brain\\6abb47ae-80b3-4d5f-b1c7-192202c6b400\\test_cases_output.md";
  fs.writeFileSync(artifactPath, markdownOutput, 'utf-8');
  console.log("Written to artifact.");
}

generateTestCases();
