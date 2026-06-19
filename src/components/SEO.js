import React from 'react';
import { Helmet } from 'react-helmet-async';  // ← ADD THIS IMPORT

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url 
}) => {
  const siteTitle = 'PoolTrader';
  const siteUrl = 'https://pooltrader.com';
  const defaultDescription = 'Professional trading pool platform where investors pool capital together for collective trading success.';
  const defaultKeywords = 'trading pool, collective trading, investment platform, forex trading, crypto trading';
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title ? `${title} | ${siteTitle}` : siteTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <link rel="canonical" href={url || siteUrl} />
      
      {/* Open Graph / Social Media */}
      <meta property="og:title" content={title || siteTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || `${siteUrl}/pooltrader.png`} />
      <meta property="og:url" content={url || siteUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || `${siteUrl}/pooltrader.png`} />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />
      <meta name="theme-color" content="#00d4aa" />
      
      {/* Favicon */}
      <link rel="icon" href="/pooltrader.png" type="image/png" />
      <link rel="apple-touch-icon" href="/pooltrader.png" />
    </Helmet>
  );
};

export default SEO;  // ← ENSURE THIS IS EXPORTED