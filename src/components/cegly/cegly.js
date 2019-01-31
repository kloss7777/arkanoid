import React, { PureComponent } from 'react';
import Cegla from '../cegla/cegla';

class Cegly extends PureComponent {

    render() {
        return this.props.cegly.map(cegla => <Cegla key={cegla.x + cegla.y} {...cegla} />);
    }

}

export default Cegly;
