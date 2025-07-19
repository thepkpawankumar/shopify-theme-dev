export const getPproductByHandle = async (storefront, handle) => {

    // Get product by handle
    // productByHandle is depreacted, we should use product now
    const response = await storefront.query(`query Product($handle: String!){
     productByHandle(handle: $handle) { 
    				id
    				title
        }
     }`, {
        variables: {

            "handle": handle


        }
    });

    return {
        success: true,
        data: response
    }
}
export const getPproductByHandle = async (storefront, handle) => {

    //Another way to do the same
    const response = await storefront.query(`query Product($handle: String!){
     product(handle: $handle) {
    		title
            tags
        }
     }`, {
        variables: {
            handle
        },
        // Pass a `cache` option with your query to customize API request caching.
        cache: storefront.CacheLong()
    });
}
