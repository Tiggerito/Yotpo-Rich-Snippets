<?php
/*
	Plugin Name: Yotpo Rich Snippets
	Description: Add structured data to the Yotpo widget so that Google can display review rich snippets. aka review stars.
	Author: Web Site Advantage
	Version: 1.0.0
	Author URI: https://websiteadvantage.com.au/?utm_source=Yotpo-Rich-Snippets-WordPress-Plugin&utm_medium=WordPress-Plugin-Page-Link&utm_campaign=Yotpo-Rich-Snippets-WordPress-Plugin	
	Plugin URI: https://websiteadvantage.com.au/Yotpo-Product-Rating-Review-Rich-Snippets?utm_source=Yotpo-Rich-Snippets-WordPress-Plugin&utm_medium=WordPress-Plugin-Page-Link&utm_campaign=Yotpo-Rich-Snippets-WordPress-Plugin
 */
 
add_action('plugins_loaded', 'wsa_yotpo_rich_snippets_init');
 
function wsa_yotpo_rich_snippets_init()
{
	add_action('wp_enqueue_scripts', 'wsa_add_yotpo_rich_snippets_script');
}
function wsa_add_yotpo_rich_snippets_script()
{
	if(!is_admin() && is_single()) {
		$post_type = get_post_type();
		
		if (in_array($post_type, array("product", "wpsc-product"))) { 
			wp_register_script( 'wsa-yotpo-rich-snippets', plugins_url( '/js/wsa-yotpo-rich-snippets.min.js', __FILE__), array(), '1.0.0', true );
			wp_enqueue_script( 'wsa-yotpo-rich-snippets' );
		}
	}
}
function wsa_add_yotpo_rich_snippets_wordpress_script()
{
/* For WordPress, yotpo places itself outside the product, so we have to itemref it */
?>
<script type="text/javascript">
try {
	document.querySelector('.yotpo-main-widget').setAttribute('id','yotpo-main-widget');
	document.querySelector('[itemtype="http://schema.org/Product"]').setAttribute('itemref','yotpo-main-widget');
} catch(err) {
	console.log('yotpoRichSnippets: Error: '+err.message);
}
</script>
<?php
}
add_action('wp_footer', 'wsa_add_yotpo_rich_snippets_wordpress_script');
?>
