# Stripes Generator

A small web app for generating striped patterns and saving them as images. It supports regular stripes and bayadère stripes, with editable colours, stripe width, direction and image size.

## Motivation

I wanted a quick way to try out colour and stripe combinations for a bayadère-style crochet scarf. Bayadère stripes are bands of varying widths, often a mix of thick bands and thin pinstripes, so they're hard to judge from a list of colours. This tool lets me see a pattern before committing yarn to it, and shuffle until one looks right.

## Features

- **Stripes:** evenly sized stripes that cycle through your colours.
- **Bayadère:** bands of random widths, skewed toward many thin bands and a few thick ones. The same colour is never used twice in a row. The pattern comes from a seeded random generator, so changing a colour or the width keeps the layout, and Shuffle generates a new one.
- **Direction:** vertical or horizontal.
- **Stripe width:** adjustable with a slider that updates the preview live. For bayadère it sets the typical band width.
- **Colours:** add, remove and edit colours (minimum of two).
- **Image size:** set a custom width and height, or choose a preset.
- **Export:** download the result as a PNG at the chosen size.

## Built with

- React and TypeScript
- Vite
- Tailwind CSS
- shadcn/ui and lucide-react for the interface
- HTML Canvas for drawing and PNG export

## Running locally

```bash
npm install
npm run dev
```