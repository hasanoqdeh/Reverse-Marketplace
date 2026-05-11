'use client';

import React from 'react';
import Head from 'next/head';

interface LandingLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const LandingLayout: React.FC<LandingLayoutProps> = ({ 
  children, 
  title = 'Reverse Marketplace - Connect Buyers with Merchants',
  description = 'Post your requests and let merchants compete to offer you the best deals'
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen">
        {children}
      </div>
    </>
  );
};

export default LandingLayout;
