<?php

function beforeFind ( $query )
  $user <- getLoggedUser();
  
  if ( $user IS SUPER_USER ) {
    return $query; 
    // ACCESS IS GRANTED  TO ALL DATA
    // NO FURTHER CONDITION IS ADDED TO THE $query
  }
  
  // GENERATE THE CONDITIONS TO ADD TO THE USER'S CONDITIONS
  $raw_conditions <- getConditionsConfig ( 'CONFIG_FILE' );
  $prepared_conditions <- parseAndPrepareConditions ( $raw_conditions );
  $query->conditions += $prepared_conditions;
  
  // GENERATE JOINS TO DATA ACCESS RELATED ENTITIES
  $join_config <- getJoinConfig ( 'CONFIG_FILE' );
  $prepared_joins <- generateJoins ( 'CONFIG_FILE' );
  $query->joins += $prepared_joins;
  
  return $query;
}
