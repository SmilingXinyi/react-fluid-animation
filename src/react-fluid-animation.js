import React, {Component} from 'react'
import PropTypes from 'prop-types'

import raf from 'raf'
import sizeMe from 'react-sizeme'

import FluidAnimation, {defaultConfig} from './fluid-animation'

class ReactFluidAnimation extends Component {
    static propTypes = {
        content: PropTypes.string,
        config: PropTypes.object,
        style: PropTypes.object,
        animationRef: PropTypes.func,
        size: PropTypes.shape({
            width: PropTypes.number,
            height: PropTypes.number
        }),
        duration: PropTypes.number,
        done: PropTypes.func,
        noGesture: PropTypes.bool
    }

    static defaultProps = {
        config: defaultConfig,
        style: {}
    }

    state = {
        running: true
    }

    UNSAFE_componentWillReceiveProps (props) {
        this._onResize()

        if (props.config) {
            this._animation.config = {
                ...props.config,
                defaultConfig
            }
        }
    }

    componentDidMount () {
        window.addEventListener('resize', this._onResize)
        this._reset(this.props)
        this._tick()
    }

    componentWillUnmount () {
        window.removeEventListener('resize', this._onResize)
        if (this._tickRaf) {
            raf.cancel(this._tickRaf)
            this._tickRaf = null
        }
    }

    render () {
        const {content, config, animationRef, style, size, done, duration, noGesture, ...rest} = this.props

        return (
            <div style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                ...style
            }}
                 {...rest}
                 ref={this._containerRef}
            >
                <canvas
                    ref={this._canvasRef}
                    onMouseDown={noGesture ? undefined : this._onMouseDown}
                    onMouseMove={noGesture ? undefined : this._onMouseMove}
                    onMouseUp={noGesture ? undefined : this._onMouseUp}
                    onTouchStart={noGesture ? undefined : this._onTouchStart}
                    onTouchMove={noGesture ? undefined : this._onTouchMove}
                    onTouchEnd={noGesture ? undefined : this._onTouchEnd}
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                />
            </div>
        )
    }

    _containerRef = (ref) => {
        this._container = ref
    }

    _canvasRef = (ref) => {
        this._canvas = ref
    }

    _onMouseDown = (event) => {
        event.preventDefault()
        this._animation.onMouseDown(event.nativeEvent)
    }

    _onMouseMove = (event) => {
        event.preventDefault()
        this._animation.onMouseMove(event.nativeEvent)
    }

    _onMouseUp = (event) => {
        event.preventDefault()
        this._animation.onMouseUp(event.nativeEvent)
    }

    _onTouchStart = (event) => {
        this._animation.onTouchStart(event.nativeEvent)
    }

    _onTouchMove = (event) => {
        this._animation.onTouchMove(event.nativeEvent)
    }

    _onTouchEnd = (event) => {
        this._animation.onTouchEnd(event.nativeEvent)
    }

    _onResize = () => {
        this._canvas.width = this._container.clientWidth
        this._canvas.height = this._container.clientHeight

        if (this._animation) {
            this._animation.resize()
        }
    }


    _done () {
        this.setState({
            running: false
        })
        this.props.done && this.props.done()
    }

    _tick = () => {
        if (this._animation) {
            this._animation.update()
        }

        if (this.state.running) {
            this._tickRaf = raf(this._tick)
        }
        else {
            this._tickRaf && raf.cancel(this._tickRaf)
        }
    }

    _reset (props) {
        const {
            animationRef,
            content,
            config,
            duration
        } = props

        this._onResize()

        this._animation = new FluidAnimation({
            canvas: this._canvas,
            content,
            config,
            duration,
            done: this._done.bind(this)
        })


        if (animationRef) {
            animationRef(this._animation)
        }
    }
}

export default sizeMe({monitorWidth: true, monitorHeight: true})(ReactFluidAnimation)
