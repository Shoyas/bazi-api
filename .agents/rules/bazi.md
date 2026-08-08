---
trigger: always_on
---

# BaZi Calculation Agent

Version: 1.0

Role:
Senior Chinese Astrology Backend Engineer

---

# Primary Goal

Your responsibility is to build a production-ready BaZi (Four Pillars of Destiny) calculation module.

The module must use the official `lunar-typescript` package.

Never implement BaZi calculations manually.

Never hardcode astrology values.

Always use the official library.

---

# Official Library

Package

lunar-typescript

Documentation

Read the official package documentation before implementing any feature.

Never guess API methods.

Use official APIs only.

---

# Business Objective

This API will be consumed by

- n8n
- Zapier
- OpenAI
- Next.js
- Mobile Apps

The API should return structured JSON.

The API should never return plain text.

OpenAI will generate the human-readable report.

The API is responsible only for calculation.

---

# Endpoint

POST

/api/v1/bazi/calculate

---

# Request

{
"birthDate":"1998-08-12",
"birthTime":"10:30",
"gender":"male",
"timezone":"Asia/Dhaka",
"language":"en"
}

---

# Validation Rules

birthDate

Required

YYYY-MM-DD

birthTime

Required

HH:mm

gender

Required

male

female

timezone

Optional

Default

Asia/Shanghai

language

Optional

Default

en

Reject invalid requests.

---

# Workflow

Receive Request

↓

Validate

↓

Convert Timezone

↓

Create Solar Object

↓

Convert Lunar

↓

Create EightChar Object

↓

Extract All Astrology Data

↓

Normalize Response

↓

Return JSON

---

# Required Data

The response should include every value that lunar-typescript can reliably provide.

---

## Solar Information

Return

solarYear

solarMonth

solarDay

solarHour

solarMinute

solarDateTime

Week Day

---

## Lunar Information

Return

lunarYear

lunarMonth

lunarDay

Leap Month

Chinese Date

---

## Four Pillars

Year Pillar

Month Pillar

Day Pillar

Hour Pillar

---

## Heavenly Stems

Year Stem

Month Stem

Day Stem

Hour Stem

---

## Earthly Branches

Year Branch

Month Branch

Day Branch

Hour Branch

---

## Five Elements

Return element for

Year

Month

Day

Hour

Return total element statistics if available.

Example

Wood

Fire

Earth

Metal

Water

---

## Hidden Stems

Return hidden stems for

Year Branch

Month Branch

Day Branch

Hour Branch

---

## Ten Gods

Return

Year Ten God

Month Ten God

Day Ten God

Hour Ten God

---

## Na Yin

Return Na Yin for

Year

Month

Day

Hour

---

## Zodiac

Return

Chinese Zodiac

Animal

---

## Constellation

Return

Western Constellation

---

## Direction

Return

Lucky Direction

if available.

Otherwise

null.

---

## Solar Terms

Return

Current Solar Term

Previous Solar Term

Next Solar Term

if supported.

---

## Luck Pillars

Return

Direction

Forward

Backward

Starting Age

Starting Date

All Luck Pillars

Example

[
{
"age":8,
"pillar":"丙辰"
},
{
"age":18,
"pillar":"丁巳"
}
]

---

## Eight Characters

Return complete Eight Character object.

---

## Five Element Analysis

Return

Strongest Element

Weakest Element

Missing Elements

Balanced

if these can be derived from library output.

If not

return null.

Never invent.

---

## Empty Branch

Return

Void Branch

if available.

---

## Twelve Growth Phases

Return

长生

沐浴

冠带

临官

帝旺

衰

病

死

墓

绝

胎

养

if available.

---

## Gods & Stars

If lunar-typescript provides

Nobleman

Peach Blossom

Academic Star

Travel Horse

General Star

Return them.

Otherwise

null.

---

# Output Structure

Return

{
"success":true,
"message":"BaZi calculated successfully.",
"data":{

"input":{},

"solar":{},

"lunar":{},

"pillars":{},

"heavenlyStems":{},

"earthlyBranches":{},

"fiveElements":{},

"hiddenStems":{},

"tenGods":{},

"naYin":{},

"zodiac":{},

"constellation":{},

"solarTerms":{},

"luckPillars":[],

"analysis":{}
}
}

---

# Null Handling

Never omit properties.

If unavailable

Return

null

instead.

The response shape must remain consistent.

---

# Timezone Rules

Always respect user timezone.

Convert correctly before calculation.

Never assume UTC.

Never ignore timezone.

---

# Language

The API returns

Chinese values

English values

when available.

Never generate translated descriptions.

Translation belongs to OpenAI.

---

# AI Responsibility

The API calculates.

OpenAI explains.

Do not mix responsibilities.

---

# Error Handling

Return meaningful messages.

Example

Invalid Birth Date

Invalid Time

Timezone Unsupported

Calculation Failed

Library Error

Unexpected Error

---

# Logging

Log

Request ID

Execution Time

Calculation Time

Errors

Never log personal information.

Never log OpenAI prompts.

---

# Performance

Target

<500ms

for one calculation.

Reuse objects where possible.

Avoid duplicate calculations.

---

# Extensibility

Design service so future modules can reuse it.

Example

Natal Chart

Compatibility

Marriage

Career

Health

Annual Luck

Monthly Luck

Daily Luck

without modifying calculation logic.

---

# Service Responsibilities

The service should

Receive validated DTO

Call lunar-typescript

Extract data

Normalize response

Return DTO

Nothing more.

---

# Forbidden

Never

Hardcode astrology values

Guess missing values

Scrape websites

Calculate manually

Use unofficial libraries

Mix controller logic

Mix OpenAI prompt generation

Return HTML

Return Markdown

Return PDF

The API returns JSON only.

---

# Code Quality

Strict TypeScript

No any

No duplicate code

Reusable helper functions

Readable methods

Small functions

Well documented

SOLID Principles

Clean Architecture

Enterprise ready

---

# Final Goal

Produce a reusable BaZi engine that becomes the single source of truth for every future astrology feature.

The engine should be accurate, deterministic, testable, scalable, and suitable for production deployment.
