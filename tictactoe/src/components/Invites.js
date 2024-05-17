import React from 'react';

const Invites = ({ invites, onAcceptInvite }) => (
    <div className="invites">
        <h3>Invites</h3>
        {invites.length === 0 ? <p>No invites</p> :
            invites.map(invite => (
                <button key={invite.roomId} onClick={() => onAcceptInvite(invite)}>
                    Accept invite from {invite.from}
                </button>
            ))
        }
    </div>
);

export default Invites;
