import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords = 'trading pool, investment, finance, trading', image = '/logo192.png', url = window.location.href }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;