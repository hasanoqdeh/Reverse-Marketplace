import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class LandingPageController {
  @Get()
  getLandingPage(@Res() res: Response) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reverse Marketplace - Connect Buyers with Merchants</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
          header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem 0; }
          nav { display: flex; justify-content: space-between; align-items: center; }
          .logo { font-size: 1.5rem; font-weight: bold; }
          .nav-links a { color: white; text-decoration: none; margin-left: 2rem; }
          .hero { padding: 4rem 0; text-align: center; }
          .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
          .hero p { font-size: 1.2rem; margin-bottom: 2rem; }
          .btn { display: inline-block; padding: 12px 24px; margin: 0 10px; text-decoration: none; border-radius: 5px; font-weight: bold; transition: all 0.3s; }
          .btn-primary { background: #667eea; color: white; }
          .btn-secondary { background: transparent; color: #667eea; border: 2px solid #667eea; }
          .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
          .features { padding: 4rem 0; background: #f8f9fa; }
          .features h2 { text-align: center; margin-bottom: 3rem; }
          .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
          .feature { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
          .feature h3 { color: #667eea; margin-bottom: 1rem; }
          footer { background: #333; color: white; text-align: center; padding: 2rem 0; }
        </style>
      </head>
      <body>
        <header>
          <div class="container">
            <nav>
              <div class="logo">🛍️ Reverse Marketplace</div>
              <div class="nav-links">
                <a href="/admin">Admin Dashboard</a>
                <a href="/api/docs">API Docs</a>
              </div>
            </nav>
          </div>
        </header>

        <section class="hero">
          <div class="container">
            <h1>Connect Buyers with Merchants</h1>
            <p>Post your requests and let merchants compete to offer you the best deals</p>
            <div>
              <a href="/api/request" class="btn btn-primary">Start Buying</a>
              <a href="/admin" class="btn btn-secondary">Admin Portal</a>
            </div>
          </div>
        </section>

        <section class="features">
          <div class="container">
            <h2>How It Works</h2>
            <div class="feature-grid">
              <div class="feature">
                <h3>📝 Post Requests</h3>
                <p>Buyers post what they need with details and images</p>
              </div>
              <div class="feature">
                <h3>🏆 Get Bids</h3>
                <p>Merchants compete with their best offers and prices</p>
              </div>
              <div class="feature">
                <h3>💰 Make Deals</h3>
                <p>Choose the best bid and complete your purchase</p>
              </div>
            </div>
          </div>
        </section>

        <footer>
          <div class="container">
            <p>&copy; 2026 Reverse Marketplace. All rights reserved.</p>
            <p>
              <a href="/admin" style="color: #667eea;">Admin Dashboard</a> | 
              <a href="/api/docs" style="color: #667eea;">API Documentation</a>
            </p>
          </div>
        </footer>
      </body>
      </html>
    `);
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'landing-page', timestamp: new Date().toISOString() };
  }
}
