import {useLoaderData} from 'react-router';

import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import { PRODUCT_FRAGMENT } from '~/fragements/product-fragements';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};


export const links = () => {

  return [
    {
      rel: 'stylesheet',
      href: '/app/styles/product-colors.css'
    }
  ]
}

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  
  const PRODUCT_COLORS_QUERY = `#graphql
  query GetColorGroups {
  metaobjects(type: "product_color_groups", first: 100) {
    edges {
      node {
        handle
        fields {
          key
          value
        }
      }
    }
  }
}`;

const COLOR_PRODUCT_QUERY = `#graphql
  query GetProductsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        handle
        featuredImage {
          altText
          id
          url
        }
      }
    }
  }`;

 const PAGE_CONTENT_QUERY =  `#graphql
  query getPageDetails($id: ID!) {
   page(id: $id) {
    title
    body
 
 }
  }`;

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

const {metaobjects: {edges: groupDetail}} = await storefront.query(PRODUCT_COLORS_QUERY);

  let color_group = [];

  for (const group of groupDetail) {
    const {node: group_data} = group;

    let products_ids = group_data?.fields.find(field => field.key === "products_list")?.value || [];
    if(!products_ids) {
      continue;
    }
    products_ids = JSON.parse(products_ids);

    const {nodes: color_products} = await storefront.query(COLOR_PRODUCT_QUERY, {
      variables :{
        ids: products_ids
      }
    });

    if(!color_products) {
      continue;
    }
    const color_product_ids = color_products?.map(color_product => color_product.id) || [];
    if(color_product_ids?.includes(product.id)){

      color_group = color_products;
      break;
    }
    
  }

  const page_id = 'gid://shopify/Page/'+product.size_chart?.value.replace("gid://shopify/OnlineStorePage/", "");

    const {page} = await storefront.query(`#graphql
  query getPageDetails($id: ID!) {
   page(id: $id) {
    title
    body
  }
  }`, {
      variables: {
        id: page_id
      }
    });

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
    color_group,
    size_chart: page || null
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context, params}) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  const {storefront} = context;


  return {};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, color_group, size_chart} = useLoaderData();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  return (
    <div className="product">
      <ProductImage image={selectedVariant?.image} />
      <div className="product-main">
        <h1>{title}</h1>
        <ProductPrice
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
        />
        <br />
        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
          color_group={color_group}
          size_chart={size_chart}
        />
        <br />
        <br />
        <p>
          <strong>Description</strong>
        </p>
        <br />
        <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
        <br />
      </div>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
