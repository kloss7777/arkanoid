import React, { PureComponent } from 'react';
import Bonus from '../bonus/bonus';

class Bonuses extends PureComponent {

    render() {
        return this.props.bonuses.map(bonus => <Bonus {...bonus} />);
    }

}

export default Bonuses;
