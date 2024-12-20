import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import world from '../world.png';

const MiniOnlineList = (props) => {

    function CreateUserItem(props) {
        return (
            <>
                <ListGroup.Item>
                    <img src={world} alt={"Eagle"} width="20" height="20" /> {" User: " + props.user.userName} 
                </ListGroup.Item>
            </>
        );
    }


    return (
        <>
                <ListGroup variant="flush">
                <ListGroup.Item className="p-3 mt-5 list-title">Online Users</ListGroup.Item>
                    {props.onlineList.map((user) =>
                        <CreateUserItem
                            user={user}
                            key={user.userId}
                        />
                        )}
                </ListGroup>
        </>
    );
}

export default MiniOnlineList;
