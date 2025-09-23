# License Attribution

This document provides license attribution for all third-party software used in AgentDash.

## Overview

AgentDash is built using various open source libraries and frameworks. This document ensures proper attribution and compliance with all applicable licenses.

## Main License

**AgentDash** is licensed under the **MIT License**.

See [LICENSE](LICENSE) file for the full license text.

## Third-Party Licenses

### Core Framework & Libraries

#### Next.js
- **License**: MIT
- **Copyright**: Vercel, Inc.
- **Usage**: React framework for production
- **Homepage**: https://nextjs.org/

#### React
- **License**: MIT
- **Copyright**: Facebook, Inc. and its affiliates
- **Usage**: UI library
- **Homepage**: https://reactjs.org/

#### TypeScript
- **License**: Apache-2.0
- **Copyright**: Microsoft Corporation
- **Usage**: Type system for JavaScript
- **Homepage**: https://www.typescriptlang.org/

#### Tailwind CSS
- **License**: MIT
- **Copyright**: Tailwind Labs, Inc.
- **Usage**: CSS framework
- **Homepage**: https://tailwindcss.com/

### UI Components & Styling

#### Radix UI
- **License**: MIT
- **Copyright**: WorkOS, Inc.
- **Usage**: Headless UI primitives
- **Homepage**: https://www.radix-ui.com/

#### Lucide React
- **License**: ISC
- **Copyright**: Lucide Contributors
- **Usage**: Icon library
- **Homepage**: https://lucide.dev/

#### Class Variance Authority (CVA)
- **License**: MIT
- **Copyright**: Joe Bell
- **Usage**: Component variant management
- **Homepage**: https://cva.style/

### Database & Backend

#### Prisma
- **License**: Apache-2.0
- **Copyright**: Prisma Data, Inc.
- **Usage**: Database ORM
- **Homepage**: https://www.prisma.io/

#### Supabase
- **License**: Apache-2.0
- **Copyright**: Supabase, Inc.
- **Usage**: Backend-as-a-Service
- **Homepage**: https://supabase.com/

### Authentication & Security

#### Clerk
- **License**: Proprietary
- **Copyright**: Clerk, Inc.
- **Usage**: Authentication service
- **Homepage**: https://clerk.com/

#### NextAuth.js
- **License**: ISC
- **Copyright**: Balázs Orbán
- **Usage**: Authentication for Next.js
- **Homepage**: https://next-auth.js.org/

### Development & Build Tools

#### ESLint
- **License**: MIT
- **Copyright**: OpenJS Foundation and other contributors
- **Usage**: JavaScript linting
- **Homepage**: https://eslint.org/

#### Prettier
- **License**: MIT
- **Copyright**: James Long and contributors
- **Usage**: Code formatting
- **Homepage**: https://prettier.io/

#### Jest
- **License**: MIT
- **Copyright**: Facebook, Inc. and its affiliates
- **Usage**: Testing framework
- **Homepage**: https://jestjs.io/

#### Playwright
- **License**: Apache-2.0
- **Copyright**: Microsoft Corporation
- **Usage**: End-to-end testing
- **Homepage**: https://playwright.dev/

### Social Media & API Integration

#### LinkedIn API SDK
- **License**: MIT
- **Copyright**: LinkedIn Corporation
- **Usage**: LinkedIn API integration
- **Homepage**: https://developer.linkedin.com/

#### Twitter API v2
- **License**: Apache-2.0
- **Copyright**: Twitter, Inc.
- **Usage**: Twitter API integration
- **Homepage**: https://developer.twitter.com/

### Utilities & Helpers

#### Date-fns
- **License**: MIT
- **Copyright**: Sasha Koss and Lesha Koss
- **Usage**: Date utility library
- **Homepage**: https://date-fns.org/

#### Zod
- **License**: MIT
- **Copyright**: Colin McDonnell
- **Usage**: TypeScript-first schema validation
- **Homepage**: https://zod.dev/

#### Framer Motion
- **License**: MIT
- **Copyright**: Framer BV
- **Usage**: Animation library
- **Homepage**: https://www.framer.com/motion/

## License Compliance

### MIT License
Most dependencies use the MIT License, which permits:
- Commercial use
- Modification
- Distribution
- Private use

With the requirement to include the license and copyright notice.

### Apache-2.0 License
Some dependencies use the Apache-2.0 License, which permits:
- Commercial use
- Modification
- Distribution
- Patent use
- Private use

With additional patent grant and trademark use restrictions.

### ISC License
Some dependencies use the ISC License, which is functionally identical to MIT.

### Proprietary Licenses
Some services (like Clerk) use proprietary licenses. Please review their terms of service.

## Attribution Requirements

### Required Attributions
- Include copyright notices for all dependencies
- Maintain license files in the project
- Document third-party usage in this file

### Optional Attributions
- Link to project homepages
- Include version information
- Document usage context

## License Audit

This project regularly audits its dependencies for license compliance:

```bash
# Check for license compliance
npm run license-check

# Generate license report
npm run license-report

# Update attribution file
npm run update-attributions
```

## Updates

This file is automatically updated when dependencies change. Manual review is recommended for:
- New dependencies
- License changes
- Major version updates

## Contact

For questions about licensing or attribution:
- **Email**: legal@agentdash.com
- **Issues**: GitHub Issues for license-related questions

---

**Last Updated**: Auto-generated on dependency changes
**Audit Date**: Check package-lock.json for latest audit
