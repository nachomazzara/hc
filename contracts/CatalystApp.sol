pragma solidity 0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";

contract CatalystApp is AragonApp {

    /// ACL
    bytes32 constant public MODIFY_ROLE = keccak256("MODIFY_ROLE");

    /// Errors
    string constant ERROR_OWNER_IN_USE = "ERROR_OWNER_IN_USE";
    string constant ERROR_DOMAIN_IN_USE = "ERROR_DOMAIN_IN_USE";
    string constant ERROR_ID_IN_USE = "ERROR_ID_IN_USE";
    string constant ERROR_KATALYST_NOT_FOUND = "ERROR_KATALYST_NOT_FOUND";


    struct Katalyst {
        bytes32 id;
        address owner;
        string domain;
    }

    mapping(bytes32 => Katalyst) public katalystById;

    mapping(bytes32 => bool) public domains;
    mapping(address => bool) public owners;


    mapping(bytes32 => uint256) public katalystIndexById;
    bytes32[] public katalystIds;

    event AddKatalyst(bytes32 indexed _id, address _owner, string _domain);
    event RemoveKatalyst(bytes32 indexed _id, address _owner, string _domain);

    function initialize() public onlyInit {
        initialized();
    }


    function addKatalyst(address _owner, string  _domain) external auth(MODIFY_ROLE) {
        bytes32 domainHash = keccak256(_domain);

        // Check if the owner and the domain are free
        require(!owners[_owner], ERROR_OWNER_IN_USE);
        require(!domains[domainHash], ERROR_DOMAIN_IN_USE);

        // Calculate a katalyst id
        bytes32 id = keccak256(
            abi.encodePacked(
                block.timestamp,
                msg.sender,
                _owner,
                _domain
            )
        );

        // Check for collisions. Shouldn't happen
        require(katalystById[id].owner == address(0), ERROR_ID_IN_USE);

        // Store katalyst by its id
        katalystById[id] = Katalyst({
            id: id,
            owner: _owner,
            domain: _domain
        });

        // Set owner and domain as used
        owners[_owner] = true;
        domains[domainHash] = true;

        // Store the katalyst id to be looped
        uint256 index = katalystIds.push(id);

        // Save mapping of the katalyst id within its position in the array
        katalystIndexById[id] = index - 1;

        // Log
        emit AddKatalyst(id, _owner, _domain);
    }

    function removeKatalyst(bytes32 _id) external auth(MODIFY_ROLE)  {
        Katalyst memory katalyst = katalystById[_id];
        bytes32 domainHash = keccak256(katalyst.domain);

        require(owners[katalyst.owner], ERROR_KATALYST_NOT_FOUND);
        require(domains[domainHash], ERROR_KATALYST_NOT_FOUND);

        // Katalyst length
        uint256 lastKatalystIndex = katalystCount() - 1;

        // Index of the katalyst to remove in the array
        uint256 removedIndex = katalystIndexById[_id];

        // Last katalyst id
        bytes32 lastKatalystId = katalystIds[lastKatalystIndex];

        // Override index of the removed katalyst with the last one
        katalystIds[removedIndex] = lastKatalystId;
        katalystIndexById[lastKatalystId] = removedIndex;

        emit RemoveKatalyst(_id, katalyst.owner, katalyst.domain);

        // Clean storage
        katalystIds.length--;
        delete katalystIndexById[_id];
        delete katalystById[_id];
        owners[katalyst.owner] = false;
        domains[domainHash] = false;

    }

    function katalystCount() public view returns (uint256) {
        return katalystIds.length;
    }
}
