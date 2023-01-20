const dims = { height: 300, width: 300, radius: 150 };
const cent = { x: dims.width / 2 + 5, y: dims.height / 2 + 5 };

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", dims.width + 200)
  .attr("height", dims.height + 150);

const graph = svg
  .append("g")
  .attr("transform", `translate(${cent.x}, ${cent.y})`);

const pie = d3
  .pie()
  .sort(null)
  .value((d) => d.cost);

const arcPath = d3
  .arc()
  .outerRadius(dims.radius)
  .innerRadius(dims.radius / 2);

//ordinal scale
const colour = d3.scaleOrdinal(d3["schemeSet3"]);

//legend setup
const legendGroup = svg
  .append("g")
  .attr("transform", `translate(${dims.width + 40}, 10)`);
const legend = d3.legendColor().shape("circle").scale(colour).shapePadding(10);


//tooltip by using d3-tip library
const tip = d3
  .tip()
  .attr("class", "d3-tip card") // We add the d3-tip class instead of the tip class
  .html((event, d) => { // It's (event, d) instead of just (d) in v6
    let content = `<div class="name">₹${d.data.name}</div>`;
    content += `<div class="cost">₹${d.data.cost}</div>`;
    content += `<div class="delete">Click slice to delete</div>`;
    return content;
  });
 
graph.call(tip);



//update function --> it contain all the things that we want to update
const update = (data) => {
  //update colour scale domain
  colour.domain(data.map((d) => d.name));

  //update and call legend
  legendGroup.call(legend);
  legendGroup.selectAll("text").attr("fill", "white");

  //join enhanced (pie) data to path elements
  const paths = graph.selectAll("path").data(pie(data));

  //console.log(pie(data));

  //handle the exit selection
  paths.exit().transition().duration(750).attrTween("d", arcTweenExit).remove();

  //handle the current DOM path updates
  paths
    .attr("d", arcPath)
    .transition()
    .duration(750)
    .attrTween("d", arcTweenUpdate);

  //enter selection
  paths
    .enter()
    .append("path")
    .attr("class", "arc") //class for styling if needed
    //.attr("d", arcPath) //d attribute for path(no more required because we are using transition)
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("fill", (d) => colour(d.data.name))
    .each(function (d) {
      this._current = d;
    })
    .transition()
    .duration(750)
    .attrTween("d", arcTweenEnter);

  // add events
    graph
    .selectAll("path")
    .on("mouseover", (event, d) => {
        tip.show(event, d);
       // handleMouseOver(event, d);
        }
    )
    .on("mouseout", (event, d) => {
        tip.hide(event, d);
        //handleMouseOut(event, d);
    }
    )
    .on("click", handleClick);

};

//data array and firestore
var data = [];

//set real time listener to db
db.collection("expenses").onSnapshot((res) => {
  res.docChanges().forEach((change) => {
    const doc = { ...change.doc.data(), id: change.doc.id };
    switch (change.type) {
      case "added":
        data.push(doc);
        break;
      case "modified":
        const index = data.findIndex((item) => item.id == doc.id);
        data[index] = doc;
        break;
      case "removed":
        data = data.filter((item) => item.id !== doc.id);
        break;
      default:
        break;
    }
  });

  update(data);
});

const arcTweenEnter = (d) => {
  var i = d3.interpolate(d.endAngle, d.startAngle);

  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

//arcTween for delete
const arcTweenExit = (d) => {
  var i = d3.interpolate(d.startAngle, d.endAngle);

  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

//arcTween for update

//use function keyword to allow use of 'this'

function arcTweenUpdate(d) {
  //interpolate between the two objects
  var i = d3.interpolate(this._current, d);
  //update the current prop with new updated data
  this._current = i(1);

  return function (t) {
    return arcPath(i(t));
  };
}

// // event handlers
// function handleMouseOver(e, d) {
//   d3.select(this)
//     .transition("changeSliceFill")
//     .duration(300)
//     .attr("fill", "#fff");
// }

// function handleMouseOut(e, d) {
//   d3.select(this)
//     .transition("changeSliceFill")
//     .duration(300)
//     .attr("fill", colour(d.data.name));
// }

// delete on click
function handleClick(e, d) {
  const id = d.data.id;
  db.collection("expenses").doc(id).delete();
}
