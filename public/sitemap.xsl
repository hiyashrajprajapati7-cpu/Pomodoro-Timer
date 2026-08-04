<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>XML Sitemap | Pomodoro Times</title>
        <style>
          body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #fbf9f4; color: #2d2b2a; padding: 40px 20px; max-width: 860px; margin: 0 auto; line-height: 1.5; }
          h1 { font-size: 24px; font-weight: 700; color: #1c1917; margin-bottom: 6px; }
          p { color: #78716c; font-size: 14px; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #e7e5e4; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
          th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #f5f5f4; font-size: 14px; }
          th { background: #f5f5f4; color: #44403c; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; }
          tr:last-child td { border-bottom: none; }
          a { color: #d97706; text-decoration: none; font-weight: 500; }
          a:hover { text-decoration: underline; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; background: #fef3c7; color: #b45309; font-size: 12px; font-weight: 600; }
        </style>
      </head>
      <body>
        <h1>XML Sitemap</h1>
        <p>This is the official XML Sitemap for <strong>Pomodoro Times</strong> (<a href="https://pomodorotimes.info/">pomodorotimes.info</a>), submitted to Google Search Console and Bing Webmaster Tools.</p>
        <table>
          <thead>
            <tr>
              <th>Page URL</th>
              <th>Priority</th>
              <th>Change Frequency</th>
              <th>Last Modified</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="s:urlset/s:url">
              <tr>
                <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
                <td><span class="badge"><xsl:value-of select="s:priority"/></span></td>
                <td><xsl:value-of select="s:changefreq"/></td>
                <td><xsl:value-of select="s:lastmod"/></td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
