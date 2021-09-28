// contetntful API
const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "0zy20tnjnzt9",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "MnoSg_wNmytHo0XcgZNm4Ar6XGRz-YfxVChIduuN0nU",
});
console.log(client);
// declare variable

const cartBtn = document.querySelector(".cart-btn"),
  closeCartBtn = document.querySelector(".close-cart"),
  clearCartBtn = document.querySelector(".clear-cart"),
  cartDom = document.querySelector(".cart"),
  cartOverlay = document.querySelector(".cart-overlay"),
  cartItems = document.querySelector(".cart-items"),
  cartTotal = document.querySelector(".cart-total"),
  cartContent = document.querySelector(".cart-content .cart-items-content"),
  productsDom = document.querySelector(".products-center");

// Cart
let cart = [];
// buttons
let buttonsDOM = [];
// getting products
class Products {
  async getProducts() {
    try {
      const contentfuldata = await client.getEntries({
        content_type: "comfyHouseProduct",
      });
      // loacal data
      // let result = await fetch("products.json");
      // let data = await result.json();

      let products = contentfuldata.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// display products

class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
        <!-- single product -->
        <article class="product">
          <div class="img-container">
            <img
              src="${product.image}"
              alt="product-1"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to cart 
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>${product.price}</h4>
        </article>
        <!-- end of single product -->`;
    });
    productsDom.innerHTML = result;
  }
  getBagButtons() {
    let bagBtns = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = bagBtns;
    bagBtns.forEach((button) => {
      let { id } = button.dataset;
      let inCart = cart.find((x) => x.id === id);

      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      } else {
        button.addEventListener("click", (even) => {
          even.target.innerText = "In Cart";
          even.target.disabled = true;

          // get product from product in local storage
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          console.log(cartItem);
          // add product to cart
          cart = [...cart, cartItem];
          console.log(cart);

          //save cart in local storage
          Storage.saveCart(cart);

          // set cart value
          this.setCartValue(cart);

          // display cart item
          this.addCartItem(cartItem);
          // showing cart
//           this.showCart();
        });
      }
    });
    console.log(bagBtns);
  }
  setCartValue(cart) {
    let tempTotal = 0;
    let itemTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemTotal;
    console.log(cartTotal, cartItems);
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${item.image} alt="" />
            <div>
              <h4>${item.title} </h4>
              <h5>$${item.price} </h5>
              <span class="remove-item" data-id=${item.id} >remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>`;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDom.classList.add("showCart");
  }
  setupApp() {
    cart = Storage.getCart();
    this.setCartValue(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDom.classList.remove("showCart");
  }

  cartLogic() {
    // clear cart buttons
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    // cart functionality

    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItems(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount++;
        Storage.saveCart(cart);
        this.setCartValue(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount--;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValue(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItems(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((x) => x.id);
    cartItems.forEach((id) => this.removeItems(id));
    console.log(cartContent.children);
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }
  removeItems(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValue(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart`;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}
// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("all-products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("all-products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  // setup App
  ui.setupApp();
  //get all products
  products
    .getProducts()
    .then((x) => {
      ui.displayProducts(x);
      Storage.saveProducts(x);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
