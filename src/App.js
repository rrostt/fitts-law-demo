import React, { Component } from 'react'
import styled, { createGlobalStyle } from 'styled-components'

const apihost = process.env.APIHOST || ''

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
    background-color: #fff;
  }
`

const AppStyled = styled.div`
  color: #08f;
  font-size: 18px;
  font-weight: normal;
`

const Section = styled.section`
  height: 100vh;
  background: ${props => props.background};
`

const H1 = styled.h1`
  text-align: center;
  font-size: 48px;
`

const Flex = styled.div`
  height: 100%;
  display: flex;
  flex-direction: ${props => props.dir || 'row'};
`

const Grow = styled.div`
flex-grow: 1;
`

const Basis = styled.div`
flex-basis: ${props => props.basis || '50%'};
`

const Formula = styled.h1`
text-align: center;
font-size: 35pt;
`

const ExperimentView = styled.div`
display: flex;
height: 100%;
`

const ExperimentClickArea = styled.div`
display: flex;
justify-content: center;
flex-direction: column;
width: 10%;
background-color: white;
text-align: center;
`

const ExperimentTarget = styled.div`
  background-color: red;
  height: 100%;
  position: relative;
  width: ${props => props.width};
  left: ${props => props.left};
`

class Experiment extends Component {
  constructor(props) {
    super(props)
    this.state = {
      start: undefined,
    }
  }

  reset () {
    const width = [5,20,50][Math.round(Math.random()*2)]
    this.setState({
      start: Date.now(),
      width,
      distance: 10 + Math.random()*(90-width)
    })
  }

  render () {
    const onClick = () => this.reset()
    const onTargetHit = () => {
      this.props.onResult({
        time: Date.now() - this.state.start,
        distance: this.state.distance + this.state.width / 2, // distance to center of target
        width: this.state.width
      });
      this.setState({start: undefined});
    }

    return <ExperimentView>
      <ExperimentClickArea onClick={onClick}>{this.state.start?' ':'click'}</ExperimentClickArea>
      <Grow>
        {this.state.start && <ExperimentTarget width={`${this.state.width}%`} left={`${this.state.distance}%`} onClick={onTargetHit}/>}
      </Grow>
    </ExperimentView>
  }
}

const ResultsXLegend = styled.div`
  position: absolute;
  top: 90%;
  width: 90%;
  left: 10%;
  text-align: center;
  border-top: 1px solid black;
`

const ResultsYLegend = styled.div`
  position: absolute;
  right: 90%;
  top: 0;
  height: 90%;
  text-align: center;
  text-orientation: mixed;
  writing-mode: vertical-lr;
  border-right: 1px solid black;
`

const Results = ({data, onClick}) => {
  const minTime = data.reduce((min, {time}) => Math.min(min, time), Number.MAX_VALUE)
  const maxTime = data.reduce((max, {time}) => Math.max(max, time), Number.MIN_VALUE)

  const color = width => width === 5 ? 'blue' : width === 20 ? 'green' : 'red'
  const left = distance => `${distance}%`
  const top = time => `${85 - (time - minTime) * 85 / (maxTime - minTime)}%`
  const size = 20

  return <Flex dir='column'>
    <Grow style={{backgroundColor: 'white', position: 'relative'}}>
      {data.map(({ time, distance, width}, i) => <div key={i} style={{ backgroundColor: color(width), left: left(distance), top: top(time), position: 'absolute', width: size, height: size }} onClick={() => onClick({time, distance, width})}></div>)}
      <ResultsXLegend>Avstånd</ResultsXLegend>
      <ResultsYLegend>Tid</ResultsYLegend>
    </Grow>
  </Flex>
}

// https://stackoverflow.com/a/31566791
function linearRegression(y,x){
  var lr = {};
  var n = y.length;
  var sum_x = 0;
  var sum_y = 0;
  var sum_xy = 0;
  var sum_xx = 0;
  var sum_yy = 0;

  for (var i = 0; i < y.length; i++) {

      sum_x += x[i];
      sum_y += y[i];
      sum_xy += (x[i]*y[i]);
      sum_xx += (x[i]*x[i]);
      sum_yy += (y[i]*y[i]);
  } 

  lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
  lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
  lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

  return lr;
}

const IDplot = ({data, onClick}) => {
  const id = data.map(({time, distance, width}) => ({
    time,
    id: Math.log(distance / width)
  }))

  const minTime = 0 //data.reduce((min, {time}) => Math.min(min, time), Number.MAX_VALUE)
  const maxTime = data.reduce((max, {time}) => Math.max(max, time), Number.MIN_VALUE)

  const minID = id.reduce((min, {id}) => Math.min(min, id), Number.MAX_VALUE)
  const maxID = id.reduce((max, {id}) => Math.max(max, id), Number.MIN_VALUE)

  const left = id => `${10 + (id - minID) * 90 / (maxID - minID) }%`
  const top = time => `${90 - (time - minTime) * 90 / (maxTime - minTime)}%`
  const size = 20

  const R = linearRegression(id.map(({time}) => time), id.map(({id}) => id))

  // plot line from minID, R.intercept + R.slope * minID to maxID, R.intercept + R.slode * maxID

  const from = [minID, R.intercept + R.slope * minID]
  const to = [maxID, R.intercept + R.slope * maxID]

  const range = (a, b, steps) => {
    const res = []
    for (let i = 0;i<steps; i++) {
      res.push( a + (b - a) * i / steps )
    }
    res.push(b)
    return res
  }

  const interpolatedRegressionLine = range(minID, maxID, 25)
    .map((id, i) => 
      <div
        key={`__${i}`}
        style={{
          backgroundColor: 'black',
          left: left(id),
          top: top(R.intercept + R.slope * id),
          position: 'absolute',
          width: size/2,
          height: size/2
        }}></div>
    )

  return <Flex dir='column'>
    <Grow style={{backgroundColor: 'white', position: 'relative'}}>
      {id.map(({ time, id}, i) => <div key={i} style={{ backgroundColor: 'red', left: left(id), top: top(time), position: 'absolute', width: size, height: size }}></div>)}

      <ResultsXLegend>log(D/W)</ResultsXLegend>
      <ResultsYLegend>Tid</ResultsYLegend>

      {interpolatedRegressionLine}

      <div style={{position: 'absolute', bottom: '20%', right: 20}}>
        T = a + b * log(D/W)<br/>
        a = {R.intercept.toFixed(2)}<br/>
        b = {R.slope.toFixed(2)}<br/>
        (R2 = {R.r2.toFixed(2)})
      </div>
    </Grow>
  </Flex>
}


class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      data: JSON.parse(window.localStorage['fitts'] || '[]'),
    }

    this.keyDown = this.keyDown.bind(this)
  }

  componentDidMount () {
    window.addEventListener('keydown', this.keyDown)
  }

  componentWillUnmount () {
    window.removeEventListener('keydown', this.keyDown)
  }

  keyDown (e) {
    console.log(e.keyCode)
    if (e.keyCode === 'R'.charCodeAt(0)) {
      this.setState({ data: [] })
      // window.localStorage.clear()
    }
  }

  render () {
    const onResult = ({time, distance, width}) => {
      this.setState({
        data: [...this.state.data, {
          time, distance, width
        }]
      }, () => window.localStorage['fitts'] = JSON.stringify(this.state.data))
    }

    const onResultClick = (needle) => {
      this.setState({
        data: this.state.data.filter(({time, distance, width}) => !(time === needle.time && distance === needle.distance && width === needle.width))
      })
    }

    return (
      <AppStyled>
        <Section background='#ffe8bd'>
          <Flex dir='column' style={{ justifyContent: 'center'}}>
            <H1>Fitts lag</H1>
          </Flex>
        </Section>

        <Section background='#c7e5ff'>
          <Flex dir='column'>
            <Basis><Experiment onResult={onResult} /></Basis>
            <Basis><Results data={this.state.data} onClick={onResultClick}/></Basis>
          </Flex>
        </Section>

        <Section>
          <Flex dir='column' style={{ justifyContent: 'center'}}>
            <Formula>T = a + b * log(2D / W)</Formula>
          </Flex>
        </Section>

        <Section>
          <IDplot data={this.state.data}></IDplot>
        </Section>

        <Section background='#ffe8bd'>
          <Flex dir='column' style={{ justifyContent: 'center'}}>
            <H1>http://fitts.rost.me/</H1>
          </Flex>
        </Section>

        <GlobalStyle />
      </AppStyled>
    )
  }
}

export default App
