function addReview(product){

let review=prompt("Write your review");

fetch(API+"?action=review&product="+product+"&text="+review);

alert("Review submitted");

}
