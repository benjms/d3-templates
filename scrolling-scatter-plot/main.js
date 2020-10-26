/*---------- D3 STUFF ----------*/

//define dimensions
const SIZE = {X:$(".graph").width(), Y:$(".graph").width()*0.6};
const MARGIN = {TOP:10, BOTTOM:100, LEFT:100, RIGHT:10};
const DIM = {WIDTH: SIZE.X - MARGIN.LEFT - MARGIN.RIGHT,
            HEIGHT: SIZE.Y - MARGIN.TOP - MARGIN.BOTTOM};

//add svg to graph class
const svg = d3.select(".graph").append("svg")
    .attr("width", SIZE.X)
    .attr("height", SIZE.Y);

//add group to svg to have margins apply to everything
const graph = svg.append("g")
    .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

//define scales
var x = d3.scaleLinear()
    .range([0, DIM.WIDTH]);

var y = d3.scaleLinear()
    .range([DIM.HEIGHT, 0]);

//define axis generators
const xAxisCall = d3.axisBottom()
const yAxisCall = d3.axisLeft()

//make axis groups
const xAxis = graph.append("g")
	.attr("class", "x axis")
    .attr("transform", `translate(0, ${DIM.HEIGHT+100})`);
    
const yAxis = graph.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(-50,0)");

//initialize variables
var state = 1;
var iris;

//read in data & first draw
d3.csv("data/iris.csv").then(data => {
    var i = 0;
    iris = [];

    data.forEach(d => {
        d.sepal_length = Number(d.sepal_length);
        d.sepal_width = Number(d.sepal_width);
        d.petal_length = Number(d.petal_length);
        d.petal_width = Number(d.petal_width);
        d.xPos = position(i, 15)[0];
        d.yPos = position(i, 15)[1];
        iris[i] = d;
        i++;
    });

    graph.append('g')
        .selectAll("circle")
        .data(iris)
        .enter()
        .append("circle")
            .attr("r", 2)
            .attr("class", function(d) {return isFocus(d)})

    draw(iris, state);
})

//function to arrange dots in grid
function gridArrange(data) {
    x.domain([0, d3.max(data, d => d.xPos)]);
    $(".x.axis").addClass("invisible")

    y.domain([0, d3.max(data, d => d.yPos)]);
    $(".y.axis").addClass("invisible")

    graph.selectAll("circle")
        .transition().duration(500)
        .attr("cx", function (d) { return x(d.xPos); } )
        .attr("cy", function (d) { return y(d.yPos); } )
}

//function to make scatter plot
function scatter(data) {
    $(".x.axis").removeClass("invisible")
    $(".y.axis").removeClass("invisible")

    updateAxes(data, fly=true);

    graph.selectAll("circle")
        .transition().duration(1000)
        .attr("cx", function (d) { return x(d.petal_width); } )
        .attr("cy", function (d) { return y(d.petal_length); } )
}

//function to zoom into focus group
function zoomInFocus(data) {
    var zoomData = data.filter(d => {return isFocus(d)==="focus"});
    d3.selectAll(".not-focus").transition().duration(1000).style("opacity", 0);

    updateAxes(zoomData);

    graph.selectAll("circle")
        .transition().duration(1000)
        .attr("cx", function (d) { return x(d.petal_width); } )
        .attr("cy", function (d) { return y(d.petal_length); } )
}

//function to zoom into non-focus group
function zoomInNonFocus(data) {
    var zoomData = data.filter(d => {return isFocus(d)==="not-focus"});
    d3.selectAll(".focus").transition().duration(1000).style("opacity", 0);

    updateAxes(zoomData);

    graph.selectAll("circle")
        .transition().duration(1000)
        .attr("cx", function (d) { return x(d.petal_width); } )
        .attr("cy", function (d) { return y(d.petal_length); } )
}

//function for zooming out to entire dataset
function zoomOut(data) {
    d3.selectAll("circle").transition().duration(1000).style("opacity", 1);

    updateAxes(data);
    
    graph.selectAll("circle")
        .transition().duration(1000)
        .attr("cx", function (d) { return x(d.petal_width); } )
        .attr("cy", function (d) { return y(d.petal_length); } )
}

//function to determine position in grid align
function position(index, obsPerRow) {
    var row = Math.floor(index / obsPerRow);
    var pos = index;

    if (pos >= obsPerRow) {
        pos = pos - obsPerRow*row;
    }
    return [pos+1, row];
}

//function to determine if in focus group
function isFocus(d) {
    if (d.petal_width > 0.8 && d.petal_length > 2.5) {
        return "focus";
    } else {
        return "not-focus";
    }
}

//function to update axes for each new section
function updateAxes(data, call=true, fly=false) {
    x.domain([d3.min(data, d => d.petal_width)-0.1, d3.max(data, d => d.petal_width)+0.1]);
    y.domain([d3.min(data, d => d.petal_length)-0.1, d3.max(data, d => d.petal_length)+0.1]);

    if (call) {
        if (fly) {
            xAxis
                .call(xAxisCall.scale(x))
                .attr("transform", `translate(0, ${DIM.HEIGHT+100})`)
                .transition().duration(1000)
                .attr("transform", `translate(0, ${DIM.HEIGHT})`);

            yAxis
                .call(yAxisCall.scale(y))
                .attr("transform", "translate(-100,0)")
                .transition().duration(1000)
                .attr("transform", "translate(0,0)")
        } else {
            xAxis
                .transition().duration(1000)
                .call(xAxisCall.scale(x))
                .attr("transform", `translate(0, ${DIM.HEIGHT})`);

            yAxis
                .transition().duration(1000)
                .call(yAxisCall.scale(y))
                .attr("transform", "translate(0,0)")
        }
    }
}

//function to call drawing functions depending on the section or state
function draw(data, state) {
    switch (state) {
        case 1:
            gridArrange(data);
            break;
        case 2:
            scatter(data);
            break;
        case 3:
            zoomInFocus(data);
            break;
        case 4:
            zoomOut(data);
            break;
        case 5:
            zoomInNonFocus(data);
            break;
        case 6:
            zoomOut(data);
            break;
    };
};



/*---------- SCROLLMAGIC STUFF ----------*/

//instanciate scrollmagic controller
var controller = new ScrollMagic.Controller();

//get number of steps and length of entire sections div
const n = $("section").length;
const duration = $(".sections").outerHeight(true);

//rounding function
function round( num, precision ) {
    return +(+(Math.round(+(num + 'e' + precision)) + 'e' + -precision)).toFixed(precision);
}

//make list with relative endpoints of all steps
var length = [];
for (let i = 1; i <= n; i++) {
    var len = $(".step" + i).outerHeight(true)/duration;

    var sum = 0;
    for (let j = 1; j <= length.length; j++) {
        sum =+ length[j-1];   
    }
    
    length[i-1] = round(len+sum, 3);
}

//initialize last_step
var last_step = 0;

//define scrollmagic scene to be triggered by sections class and measure at 25% from the top
var scene = new ScrollMagic.Scene({triggerHook: 0.25, triggerElement: ".sections", offset: 0, duration: duration})
                .addTo(controller)
                .on("progress", function (e) {
                    //define progress as how far we've scrolled (0 to 1)
                    var progress = e.progress.toFixed(3);
                    
                    //use progess and relative endpoints to determine in which section we are
                    var step;
                    if (progress < length[0]) {
                        step = 1;
                    } else if (progress < length[1]) {
                        step = 2;
                    } else if (progress < length[2]) {
                        step = 3;
                    } else if (progress < length[3]) {
                        step = 4;
                    } else if (progress < length[4]) {
                        step = 5;
                    } else if (progress < length[5]) {
                        step = 6;
                    }

                    if (!(step === last_step)) {
                        $(".step").removeClass("active")
                        $(".step" + step).addClass("active");
                        draw(iris, step);
                    }
                    
                    })