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


            function startup( $controller ) { 
              $user <- getLoggedUser();  
              $basic_log = {
                'user_id' : $user->id,
                'session_id' => USER_SESSION_ID,
                'method' => $request->method,
                'controller' => $controller->name,
                'action' => $controller->action,
                'resource' => $controller->default_resource_name,
                'resource_id' => NULL,
                'importance' => 0,
                'result' => FAIL
              }
              $log_db_id <- $database->save( $basic_log );  
            }
            
            // CONTROLLER ACTION HAPPENS HERE,
            // CONTROLLER CAN:
            //    - setResourceId(MODEL_ID_TYPE);
            //    - setResourceName(STRING);
            //    - setImportance(NUM);
            //    - setActionResult(BOOLEAN)
            
            function beforeRender( $controller ) {
              $final_log = $database->read( $log_db_id );
              $final_log += CONTROLLER_DEFINED_PARAMETERS;
              $database->save( $final_log );
            }






