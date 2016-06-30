# Yotpo
Yotpo Rich Snippet Solutions

The JavaScript must be added or included after the point where the Yotpo placeholder is added (I'd recommend just before the </body>). By default it looks for the Yotpo placeholder using the following css selectors:

.yotpo-main-widget
.yotpo.placeholder

It has been tested on BigCommerce and Shopify.

A WordPress plugin has been developed to work with WooCommerce and WP e-Commerce. It is in the WordPress folder. A basic WooCommerce install was tested (one review).

To make the review scores accurate the Start Distribution widget needs to be enabled.

For it to generate valid review dates it needs the Yotpo date format set to YYYY-MM-DD. The setting is here: Tools>On-site->Reviews Widget->General Settings
