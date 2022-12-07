//選取 HTML 元素
const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const cartList = document.querySelector('.shoppingCart-tableList');

//執行
function init(){
    getProductList()
    getCartList();
}
init();


//載入產品清單
let productData = [];
let cartData = [];
function getProductList(){
    axios.get('https://livejs-api.hexschool.io/api/livejs/v1/customer/yubaozi/products')
    .then(function(response){
        productData = response.data.products;
        renderProductList();
    })
    .catch(error => console.log(error))
};


//回傳productList的內容
function combineProductHTMLItem(item){
    return `<li class="productCard">
    <h4 class="productType">${item.category}</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="js-addCart" id="addCardBtn" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
    <p class="nowPrice">NT$${toThousands(item.price)}</p>
</li>`
}

//渲染productList內容
function renderProductList(){
    let str = '';
    productData.forEach(item => {
        str += combineProductHTMLItem(item);
    })
    productList.innerHTML = str;
};


//監聽產品清單以轉換選單
productSelect.addEventListener('change',function(e){
    const category = e.target.value;
    if (category=="全部"){
        renderProductList();
        return;
    }
    let str = '';
    productData.forEach(function(item){
        if (item.category == category){
            str += combineProductHTMLItem(item)
        }
    })
    productList.innerHTML = str;
})

productList.addEventListener("click",function(e){
    e.preventDefault();
    let addCartClass = e.target.getAttribute("class");
    if(addCartClass!=="js-addCart"){
        return;
    }
    let productId =e.target.getAttribute("data-id");
    let numCheck = 1;

    cartData.forEach(function(item){
        if(item.product.id === productId){
            numCheck = item.quantity += 1;
        }
    })
    axios.post("https://livejs-api.hexschool.io/api/livejs/v1/customer/yubaozi/carts",{
        "data": {
            "productId": productId,
            "quantity": numCheck
          }
    }).then(function(response){
        alert("加入購物車");
        getCartList();
    })
    
})


    

function getCartList(){
    axios.get("https://livejs-api.hexschool.io/api/livejs/v1/customer/yubaozi/carts")
    .then(function(response){
        // productData = response.data.products;
        // renderProductList();
        // console.log(response.data.finalTotal);
        document.querySelector(".js-total").textContent = toThousands(response.data.finalTotal);
        cartData = response.data.carts;
        let str="";
        cartData.forEach(function(item){
            str +=` <tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${toThousands(item.product.price)}</td>
            <td>${item.quantity}</td>
            <td>NT$${toThousands(item.product.price * item.quantity)}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons" data-id="${item.id}">
                    clear
                </a>
            </td>
        </tr>`
        });
        cartList.innerHTML = str;
    })
}

cartList.addEventListener('click',function(e){
    e.preventDefault();
    const cartId = e.target.getAttribute("data-id");
    if(cartId == null){
        alert("你點到其他東西了～～");
        return;
    }
    console.log(cartId);
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/yubaozi/carts/${cartId}`)
    .then(function(response){
        alert("刪除單筆購物車成功！");
        getCartList();
    })
})

//刪除全部購物車流程
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/yubaozi/carts/`)
    .then(function(response){
        alert("刪除全部購物車成功！");
        getCartList();
    })
    .catch(function(response){
        alert("購物車已清空，請勿重複點擊！")
    })
})

//填寫預定資料
const orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click",function(e){
    e.preventDefault();
    if(cartData.length== 0){
        alert('請加入購物車！');
        return;
    }
    const customerName = document.querySelector('#customerName').value;
    const customerPhone = document.querySelector('#customerPhone').value;
    const customerEmail = document.querySelector('#customerEmail').value;
    const customerAddress = document.querySelector('#customerAddress').value;
    const customerTradeWay = document.querySelector('#tradeWay').value;
    console.log(customerName,customerPhone,customerEmail,customerAddress,customerTradeWay);
    if(customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || customerTradeWay== ""){
        alert('請輸入訂單資訊！');
        return;
    }
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/yubaozi/orders`,{
        "data": {
            "user": {
              "name": customerName,
              "tel": customerPhone,
              "email": customerEmail,
              "address": customerAddress,
              "payment": customerTradeWay
            }
          }
    }).then(function(response){
        alert('訂單已成功建立');
        document.querySelector('#customerName').value = "";
        document.querySelector('#customerPhone').value = "";
        document.querySelector('#customerEmail').value = "";
        document.querySelector('#customerAddress').value = "";
        document.querySelector('#tradeWay').value = "ATM";
        getCartList();
    })

    
})

//處理小數點
function toThousands(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
};