pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";

contract CatalystApp is AragonApp {

    /// Events
    event AddCatalyst(string _katalyst);
    event RemoveCatalyst(string _katalyst);

    /// State
    mapping(uint256 => bool) public catalystServers;
    string[] public servers;

    /// ACL
    bytes32 constant public MODIFY_ROLE = keccak256("MODIFY_ROLE");

    function initialize() public onlyInit {
        initialized();
    }

    /**
     * @notice Increment the counter by `step`
     * @param _katalyst Amount to increment by
     * @param _authorized Amount to increment by
     */
    function modify(string _katalyst, bool _authorized) external auth(MODIFY_ROLE) {

        catalystServers[servers.length] = _authorized;
        if (_authorized) {
            servers.push(_katalyst);
            emit AddCatalyst(_katalyst);
        } else {
            emit RemoveCatalyst(_katalyst);
        }
    }

    function size() public view returns (uint256) {
        return servers.length;
    }
}
