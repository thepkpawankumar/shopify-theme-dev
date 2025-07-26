import { Image } from "@shopify/hydrogen"
import { Link } from "react-router"
import { ProductColorsModal } from "./ProductColorsModal";
import { useState } from "react";

function ProductColorItem({product, onClose}) {
   return  <div className="product-color-thumbnail" key={product.id}>
    <Link to={`/products/${product.handle}`} onClick={onClose}>
    <Image
    alt={product.featuredImage.altText || product.title}
    aspectRatio="1/1"
    data={product.featuredImage}
    key={product.featuredImage.id}
    sizes="(min-width: 45em) 50vw, 100vw"
    />
    <h2 className="ProductMeta__Title Heading u-h2 hidden">{product.title}</h2>

    </Link>
    </div>
}
export function ProductColors({ color_group }) {

    const [isModalOpen, setModalOpen] = useState(false);
    return (

        color_group &&
        <div className="show__popup_color" key="show__popup_color">

            <p className="select_color_option">

                Select colors  <span className="product__countt">

                    {color_group?.length}
                </span>

            </p>
            <div className="product_gris_select">
                <div className="show_more_productss">
                    {color_group.slice(0, 4).map(product => <ProductColorItem onClose={() => setModalOpen(false)} key={product.id} product={product} />)}

                </div>

                <a id="product-colors-open-popup-button" onClick={() => setModalOpen(true)} 
                className="icon-button no-underline">
                    <span className="text">
                        <u>More Colors</u>
                    </span>
                    <Image src="https://cdn.shopify.com/s/files/1/0635/7558/8960/files/arrow_forward_ios.png?v=1750788030"
                    width={"auto"}
                    />
                  
                </a>

            </div>

        <ProductColorsModal isModalOpen={isModalOpen} onClose={() => setModalOpen(false)}>
           <div className="product-colors-popup-content">
       
       <div className="">
        <div className="product-color-thumbnail-wrapper">
       {color_group.map(product => <ProductColorItem key={product.id} product={product}
       onClose={() => setModalOpen(false)}
       />)}
        </div>            
       </div>
     </div>
        </ProductColorsModal>
            
        </div>
    )
}