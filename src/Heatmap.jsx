import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fetchData, processData } from "./utils";

const Heatmap = () => {
  const [data, setData] = useState(null);
  const svgRef = useRef();

  useEffect(() => {
    fetchData().then((rawData) => {
      const processedData = processData(rawData);
      setData(processedData);
    });
  }, []);

  useEffect(() => {
    if (data) {
      renderHeatmap(data);
    }
  }, [data]);

  return <svg ref={svgRef} width="100%" height="500px" />;
};

const renderHeatmap = (data) => {
  const svg = d3.select(d3.ref(svgRef.current));
  svg.selectAll("*").remove();

  const margin = { top: 20, right: 10, bottom: 50, left: 60 };
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;

  const xScale = d3
    .scaleBand()
    .domain(data.map((_, i) => i))
    .range([0, width])
    .padding(0.05);

  const yScale = d3
    .scaleBand()
    .domain(data.map((d) => d.name))
    .range([height, 0])
    .padding(0.1);

  const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([-20, 40]); // Assuming temperature range

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .selectAll("rect")
    .data(
      data.flatMap((city) =>
        city.temperatures.map((temp, weekIndex) => ({
          ...city,
          week: weekIndex,
          temp,
        })),
      ),
    )
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.week))
    .attr("y", (d) => yScale(d.name))
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(d.temp));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisBottom(xScale).tickFormat((i) => `Week ${i + 1}`));

  svg
    .append("g")
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisLeft(yScale));
};

export default Heatmap;
