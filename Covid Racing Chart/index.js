
var flag = 0;
var o = "World";
let currIdx = 0;
var didClickIt = false;
document.getElementById("submitter").addEventListener("click",function(){

    didClickIt = true;
    currIdx = 0;
    o=document.getElementById("output"),v=document.getElementById("userInput").value;
    if(o.textContent!=="World"){
        o.textContent=v;
        flag = 1;
    }else{
        o.innerText=v;
       //relode the window to show the new data
        if(flag == 1){
            window.location.reload();
            currIdx = 0;
        }
    }

    console.log(o.innerText);
    console.log(o.textContent);
    
});


const svg = d3.select(".canvas").append("svg");

let countries;
let countriesData;
let datesData;
let continentsData;
let populationDensityData;
d3.csv("data.csv").then((data) => {
  //console.log(data);
  cleanData(data);
});

const cleanData = (data) => {
  let continents = [
    "Asia",
    "Australia",
    "North America",
    "South America",
    "Antartica",
    "Africa",
    "Europe",
    "World",
    "High income",
    "European Union",
    "Upper middle income",
    "Lower middle income",
    "International",
  ];

  //console.log(continents);

  let tempCountries = [];
  data.map((item) => {
    let found = false;
    for (let i = 0; i < tempCountries.length; i++) {
      if (tempCountries[i] === item.location) {
        found = true;
        break;
      }
    }

    for (let i = 0; i < continents.length; i++) {
      if (continents[i] === item.location) {
        found = true;
        break;
      }
    }
    if (!found) tempCountries.push(item.location);
  });

  let finalData = [];
  let dates = [];
  let continent = [];
  let populationDensity = [];
  for (let i = 0; i < tempCountries.length; i++) {
    let countryArray = [];
    let dateArray = [];
    let continentArray = [];
    let populationDensityArray = [];
    for (let j = 0; j < data.length && countryArray.length <= 600; j++) {
      if (tempCountries[i] === data[j].location) {
         //console.log(data[j].location);
        countryArray.push(parseInt(data[j].total_cases, 10));
        dateArray.push(data[j].date);
        continentArray.push(data[j].continent);
        populationDensityArray.push(parseInt(data[j].population_density, 10));
      }
    }
    finalData.push(countryArray);
    dates.push(dateArray);
    continent.push(continentArray);
    populationDensity.push(populationDensityArray);
  }
  countries = tempCountries;
  countriesData = finalData;
  datesData = dates;
  continentsData = continent;
  populationDensityData = populationDensity;
  //console.log(countries.length, countriesData.length);
  //console.log(datesData[0][0], countriesData[0][0]);
  //console.log(dates);
};


let render = (data, max) => {
  data.sort((b, a) => {
    return a.value - b.value;
  });
  let xScale = d3.scaleLinear().domain([0, max]).range([0, window.innerWidth-20]);
  let yScale = d3
    .scaleBand()
    .domain(
      data.map((runner, index) => {
        return index;
      })
    )
    .paddingInner(0.1)
    .range([0, 10000]);

  const colorScale = d3.scaleOrdinal(d3["schemeSet3"]).domain(data.map((item) => item.name));

  let rects = svg.selectAll("rect").data(data, (entry, index) => entry.name);
  rects
    .attr("height", yScale.bandwidth())
    .attr("fill", (d, i) => colorScale(d.name))
    .transition()
    .ease(d3.easeLinear)
    .duration(200)
    .attr("y", (d, i) => yScale(i))
    .attr("width", (d) => xScale(d.value));
  rects
    .enter()
    .append("rect")
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(d.name))
    .attr("y", (d, i) => yScale(i))
    .transition()
    .ease(d3.easeLinear)
    .duration(200)
    .attr("width", (d) => xScale(d.value));

    //exting rects
    rects.exit().remove();

    let texts = svg
    .selectAll("text")
    .data(data, (entry, index) => entry.name)
    .join((enter) =>
      enter.append("text").attr("y", (d, i) => {
        return yScale(i) + yScale.bandwidth() / 2;
      })
    )
    .text((d) => `${d.name} 🦠 @ cases : ${Math.floor(d.value)}`)
    .style("font-family", "Arial")
    .style("font-weight", 600)
    .transition()
    .ease(d3.easeLinear)
    .duration(200)
    .attr("y", (d, i) => {
      return yScale(i) + yScale.bandwidth() / 2;
    });

};



 setInterval(() => {
  if (!countries && !countriesData && !datesData && !continentsData ) {
    console.log("DATA NOT HERE");
    return;
  }

  let data = [];
  for (let i = 0; i < countries.length; i++) {
    if (!countriesData[i][currIdx] || countriesData[i][currIdx].isNan || datesData[i][currIdx].isNan || continentsData[i][currIdx].isNan ) continue;


 //push only if data contain particular conitnent
     if(o.innerText=="World"){
        flag = 0;
     }

   else if (continentsData[i][currIdx] !== o.innerText && flag === 1 ){
      continue;
    }

    data.push({
      name: countries[i],
      value: countriesData[i][currIdx],
      date: datesData[i][currIdx],
      continent: continentsData[i][currIdx],
      populationWise: populationDensityData[i][currIdx],
      color: "pink",
    });
  }

  //console.log(data);

 
  currIdx++;

  let max = -1;
  data.map((item) => {
    if (item.value > max) {
      max = item.value;
    }
  });

  render(data, max);
}, 200);






